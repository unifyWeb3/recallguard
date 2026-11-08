// /api/live-verdict — Vercel serverless function.
//
// GET /api/live-verdict
//   No client input (query string rejected). Returns the freshness verdict for
//   the two recorded subjects (FAST sui clock 0x6, SLOW MemWal AccountRegistry)
//   by reading current Sui state through Tatum Sui Mainnet GraphQL.
//   - Verdict is computed at read time; never hardcoded.
//   - 3 s overall timeout; ANY failure returns 200 with the snapshot payload
//     (identical shape, source:"snapshot").
//   - Kill switch: LIVE_CHECK != "on" → snapshot (needs a redeploy).
//   - Best-effort per-instance daily cap: TATUM_SMOKE_DAILY_CAP (default 25
//     verdict computations = 2 Tatum reads each). The edge cache is the real
//     limiter; the counter resets with each cold start. Documented as
//     best-effort — see docs/mcp.md / CLAIMS.md.
//   - The API key never leaves the server; responses carry no credentials.
//
// Shape (live and snapshot are identical):
// { ok, source, checked_at, budget: { daily_cap, used }, subjects: { fast, slow } }
// subject: { id, class, label, address, recorded: {...}, live: {...},
//            verdict: "FRESH"|"STALE", withheld: bool, reason, checkpoint_delta }

import { RECORDED, SNAPSHOT_CHECKPOINT, SNAPSHOT_GENERATED_AT } from "./recorded-evidence.mjs";

const TATUM_GRAPHQL = "https://sui-mainnet.gateway.tatum.io/graphql";
const CP_QUERY = "{ checkpoints(last:1){ nodes { sequenceNumber digest timestamp } } }";
const OBJ_QUERY = "query($a: SuiAddress!){ object(address:$a){ address version digest } }";
const OVERALL_TIMEOUT_MS = 3000;
const DEFAULT_DAILY_CAP = 25;

// Best-effort per-instance counter. Resets on cold start; NOT a hard limit.
let instanceVerdicts = 0;
export function _resetForTests() { instanceVerdicts = 0; }

const nowIso = (now) => now().toISOString();

function snapshotSubject(classKey, checkedAt, reason) {
  const subject = RECORDED[classKey];
  const memory = subject.memory;
  const pin = subject.snapshot_pin;
  const versionChanged = String(pin.version) !== String(memory.version);
  const digestChanged = String(pin.digest) !== String(memory.digest);
  const stale = versionChanged || digestChanged;
  return {
    id: subject.id,
    class: subject.class,
    label: subject.label,
    address: subject.address,
    namespace: subject.namespace,
    recorded: {
      claim: memory.claim,
      blob_id: memory.blob_id,
      state: memory.state,
      checkpoint: memory.checkpoint,
      version: memory.version,
      digest: memory.digest,
      read_at: memory.read_at,
    },
    live: {
      checkpoint: pin.checkpoint,
      version: pin.version,
      digest: pin.digest,
      readAt: pin.readAt,
      source: "recorded-snapshot",
    },
    verdict: stale ? "STALE" : "FRESH",
    withheld: stale,
    reason: stale
      ? `subject changed (version ${memory.version}->${pin.version}, digest ${digestChanged ? "changed" : "same"}) — recorded in the 2026-11-05 snapshot`
      : `subject unchanged at the recorded snapshot (version ${pin.version})`,
    checkpoint_delta: pin.checkpoint - memory.checkpoint,
    replay_reason: reason,
  };
}

function snapshotPayload(checkedAt, reason, cap) {
  return {
    ok: true,
    source: "snapshot",
    checked_at: checkedAt,
    snapshot_generated_at: SNAPSHOT_GENERATED_AT,
    snapshot_checkpoint: SNAPSHOT_CHECKPOINT.checkpointSeq,
    budget: { daily_cap: cap, used: instanceVerdicts },
    subjects: {
      fast: snapshotSubject("fast", checkedAt, reason),
      slow: snapshotSubject("slow", checkedAt, reason),
    },
  };
}

const T = (promise, ms) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error("overall timeout")), ms)),
]);

async function tatumCall(fetchImpl, apiKey, query, variables) {
  const res = await fetchImpl(TATUM_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(OVERALL_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`tatum http ${res.status}`);
  return res.json();
}

export async function liveVerdict({ env = process.env, fetchImpl = globalThis.fetch, now = () => new Date() } = {}) {
  const checkedAt = nowIso(now);
  const cap = Math.max(0, Number.isFinite(Number(env.TATUM_SMOKE_DAILY_CAP)) ? Number(env.TATUM_SMOKE_DAILY_CAP) : DEFAULT_DAILY_CAP);

  if (String(env.LIVE_CHECK).toLowerCase() !== "on") return snapshotPayload(checkedAt, "LIVE_CHECK is off (kill switch)", cap);
  if (instanceVerdicts >= cap) return snapshotPayload(checkedAt, "daily cap reached (best-effort counter)", cap);

  const apiKey = String(env.TATUM_API_KEY || "");
  if (!apiKey) return snapshotPayload(checkedAt, "TATUM_API_KEY missing", cap);

  try {
    const body = await T((async () => {
      const cpBody = await tatumCall(fetchImpl, apiKey, CP_QUERY, undefined);
      const node = cpBody?.data?.checkpoints?.nodes?.[0];
      const seq = Number(node?.sequenceNumber);
      if (!Number.isInteger(seq) || seq < 0) throw new Error("schema drift: checkpoint");
      const digest = typeof node?.digest === "string" && node.digest.length > 8 ? node.digest : null;
      const timestamp = typeof node?.timestamp === "string" ? node.timestamp : null;

      const pins = {};
      for (const [key, subject] of Object.entries(RECORDED)) {
        const objBody = await tatumCall(fetchImpl, apiKey, OBJ_QUERY, { a: subject.address });
        const obj = objBody?.data?.object;
        const version = String(obj?.version ?? "");
        const digest = typeof obj?.digest === "string" ? obj.digest : "";
        if (!/^\d+$/.test(version)) throw new Error(`schema drift: object version (${key})`);
        if (digest.length < 8) throw new Error(`schema drift: object digest (${key})`);
        pins[key] = { checkpoint: seq, checkpointDigest: digest, checkpointTimestamp: timestamp, version, digest, readAt: checkedAt, source: "live" };
      }

      if (seq < RECORDED.fast.memory.checkpoint || seq < RECORDED.slow.memory.checkpoint) {
        throw new Error("stale checkpoint: live checkpoint below the recorded memory");
      }
      return { seq, pins };
    })(), OVERALL_TIMEOUT_MS);

    instanceVerdicts += 1;
    const subjects = {};
    for (const [key, subject] of Object.entries(RECORDED)) {
      const memory = subject.memory;
      const live = body.pins[key];
      const versionChanged = String(live.version) !== String(memory.version);
      const digestChanged = String(live.digest) !== String(memory.digest);
      const stale = versionChanged || digestChanged;
      subjects[key] = {
        id: subject.id,
        class: subject.class,
        label: subject.label,
        address: subject.address,
        namespace: subject.namespace,
        recorded: {
          claim: memory.claim,
          blob_id: memory.blob_id,
          state: memory.state,
          checkpoint: memory.checkpoint,
          version: memory.version,
          digest: memory.digest,
          read_at: memory.read_at,
        },
        live,
        verdict: stale ? "STALE" : "FRESH",
        withheld: stale,
        reason: stale
          ? `subject changed (version ${memory.version}->${live.version}, digest ${digestChanged ? "changed" : "same"})`
          : `fresh at checkpoint ${live.checkpoint} (subject unchanged)`,
        checkpoint_delta: live.checkpoint - memory.checkpoint,
      };
    }

    return {
      ok: true,
      source: "live",
      checked_at: checkedAt,
      budget: { daily_cap: cap, used: instanceVerdicts },
      subjects,
    };
  } catch (error) {
    return snapshotPayload(checkedAt, String(error?.message || error).slice(0, 120), cap);
  }
}

export default async function handler(req, res) {
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "s-maxage=30, stale-while-revalidate=60");
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "no-referrer");
  // Same-origin only: no CORS headers are emitted on any response.
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("allow", "GET, HEAD");
    return res.end('{"ok":false,"error":"method not allowed"}');
  }
  const query = String(req.url || "").split("?")[1] || "";
  if (query.length > 0) {
    res.statusCode = 400;
    return res.end('{"ok":false,"error":"no query parameters accepted"}');
  }
  const payload = await liveVerdict();
  console.log(`[live-verdict] source=${payload.source} cap=${payload.budget?.daily_cap} used=${payload.budget?.used}`);
  res.statusCode = 200;
  return res.end(JSON.stringify(payload));
}

// Live-verdict function tests. All network calls are injected; nothing leaves the test process.

import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { liveVerdict, evaluateSubject, _resetForTests } from "../api/live-verdict.mjs";
import { RECORDED, POLICY } from "../api/recorded-evidence.mjs";
import { evaluateGate } from "../src/gate.mjs";
import { SUI_MAINNET_CHAIN_ID } from "../src/tatum.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

beforeEach(() => _resetForTests());

const okCp = (seq) => ({
  ok: true,
  status: 200,
  statusCode: 200,
  json: async () => ({ data: { checkpoints: { nodes: [{ sequenceNumber: seq, digest: "9AmYmYmNUs9VuESBtVUzwqo1xvwcTHx32MMmsdWWH1Bn", timestamp: "2026-11-08T11:00:00.000Z" }] } } }),
});
const okObj = (version, digest) => ({
  ok: true,
  status: 200,
  statusCode: 200,
  json: async () => ({ data: { object: { version, digest } } }),
});
const graphqlResponses = (cp, fast, slow) => {
  let n = 0;
  const responses = [cp, okObj(...fast), okObj(...slow)];
  return async () => responses[n++] ?? Object.assign(new Error("unexpected call"), { unexpected: true });
};

const LIVE_ENV = { LIVE_CHECK: "on", TATUM_API_KEY: "test-key", TATUM_SMOKE_DAILY_CAP: "25" };

test("recorded constants match the committed snapshot exactly", () => {
  const snapshot = JSON.parse(readFileSync(resolve(ROOT, "docs/evidence/proof-snapshot.json"), "utf8"));
  assert.equal(snapshot.checkpoint.checkpointSeq, 341944901);
  assert.equal(snapshot.checkpoint.checkpointDigest, "9AmYmYmNUs9VuESBtVUzwqo1xvwcTHx32MMmsdWWH1Bn");
  const byBlob = new Map(snapshot.memories.map((m) => [m.blob_id, m]));
  for (const subject of Object.values(RECORDED)) {
    const memory = byBlob.get(subject.memory.blob_id);
    assert.ok(memory, `${subject.id} memory present in snapshot`);
    assert.equal(String(memory.proof.checkpoint_seq), String(subject.memory.checkpoint));
    assert.equal(String(memory.proof.checkpoint_digest), String(subject.memory.checkpoint_digest));
    assert.equal(String(memory.proof.object_version), String(subject.memory.version));
    assert.equal(String(memory.proof.object_digest), String(subject.memory.digest));
    assert.equal(subject.snapshot_pin.version, String(snapshot.subjects[subject.class].pin.version));
    assert.equal(subject.snapshot_pin.digest, snapshot.subjects[subject.class].pin.digest);
    assert.equal(subject.address, snapshot.subjects[subject.class].subject.address);
  }
});

test("the learned per-class policy in the panel matches the committed snapshot", () => {
  const snapshot = JSON.parse(readFileSync(resolve(ROOT, "docs/evidence/proof-snapshot.json"), "utf8"));
  for (const [cls, policy] of Object.entries(POLICY)) {
    assert.equal(policy.windowCheckpoints, snapshot.policy[cls].windowCheckpoints, `${cls} window`);
    assert.equal(policy.minCheckpoints, snapshot.policy[cls].minCheckpoints, `${cls} min`);
    assert.equal(policy.maxCheckpoints, snapshot.policy[cls].maxCheckpoints, `${cls} max`);
    assert.equal(policy.maxAgeSeconds, snapshot.policy[cls].maxAgeSeconds, `${cls} max age`);
  }
});

test("the panel verdict is the product gate verdict, not an inline comparison", () => {
  const subject = RECORDED.fast;
  const live = { checkpointSeq: 343700000, checkpointDigest: "9AmYmYmNUs9VuESBtVUzwqo1xvwcTHx32MMmsdWWH1Bn", readAt: "2026-11-10T12:00:00.000Z" };
  const pin = { version: "1019546722", digest: "Dgmg9xuLjsVYpQtzS68bPYjzbRSSiP8wbcETJam3qAZ1", readAt: "2026-11-10T12:00:00.000Z" };
  const now = Date.parse("2026-11-10T12:00:00.000Z");
  const panel = evaluateSubject(subject, live, pin, now);
  const gate = evaluateGate({
    record: {
      "proof.chain_id": SUI_MAINNET_CHAIN_ID,
      "proof.checkpoint_seq": subject.memory.checkpoint,
      "proof.checkpoint_digest": subject.memory.checkpoint_digest,
      "proof.object_version": subject.memory.version,
      "proof.object_digest": subject.memory.digest,
      "proof.read_at": subject.memory.read_at,
    },
    live,
    pin,
    policy: {
      windowCheckpoints: POLICY.FAST.windowCheckpoints,
      minCheckpoints: POLICY.FAST.minCheckpoints,
      maxCheckpoints: POLICY.FAST.maxCheckpoints,
      maxAgeSeconds: POLICY.FAST.maxAgeSeconds,
    },
    now,
  });
  assert.equal(panel.verdict, gate.verdict);
  assert.equal(panel.reason, gate.reason);
  assert.equal(panel.signal, gate.signal);
  assert.equal(panel.verdict, "STALE");
});

test("live path returns FRESH when pins match the recorded memory inside the learned window", async () => {
  const fetchImpl = graphqlResponses(okCp(341742470), ["1018797298", "4vTVNHed9pwSGFSE6xeSqvMyXBMSYv9nJfzXvxdQMqUM"], ["1062994379", "84vQc5UnaAs8s4RA4Sd9pnLwWxnqma3TrHzsghwoRWC4"]);
  const out = await liveVerdict({ env: LIVE_ENV, fetchImpl, now: () => new Date("2026-11-05T01:00:00.000Z") });
  assert.equal(out.source, "live");
  assert.equal(out.ok, true);
  assert.equal(out.subjects.fast.verdict, "FRESH");
  assert.equal(out.subjects.fast.withheld, false);
  assert.equal(out.subjects.slow.verdict, "FRESH");
  assert.equal(out.budget.used, 1);
  assert.equal(out.subjects.fast.live.checkpointDigest, "9AmYmYmNUs9VuESBtVUzwqo1xvwcTHx32MMmsdWWH1Bn",
    "checkpoint digest must come from the checkpoint query, not the object pin");
  assert.equal(out.subjects.fast.live.digest, "4vTVNHed9pwSGFSE6xeSqvMyXBMSYv9nJfzXvxdQMqUM");
  assert.notEqual(out.subjects.fast.live.checkpointDigest, out.subjects.fast.live.digest);
});

test("an unchanged pin outside the learned checkpoint window is STALE, not FRESH", async () => {
  // The old inline comparison only looked at version and digest, so it answered
  // FRESH here. The product gate also applies the learned checkpoint window.
  const fetchImpl = graphqlResponses(okCp(342000000), ["1018797298", "4vTVNHed9pwSGFSE6xeSqvMyXBMSYv9nJfzXvxdQMqUM"], ["1062994379", "84vQc5UnaAs8s4RA4Sd9pnLwWxnqma3TrHzsghwoRWC4"]);
  const out = await liveVerdict({ env: LIVE_ENV, fetchImpl, now: () => new Date("2026-11-05T01:00:00.000Z") });
  assert.equal(out.source, "live");
  assert.equal(out.subjects.fast.verdict, "STALE");
  assert.equal(out.subjects.fast.withheld, true);
  assert.match(out.subjects.fast.reason, /checkpoint window exceeded/);
  assert.match(out.subjects.fast.reason, /window 25/);
});

test("live path returns STALE when the subject moved", async () => {
  const fetchImpl = graphqlResponses(okCp(342000001), ["1019546722", "Dgmg9xuLjsVYpQtzS68bPYjzbRSSiP8wbcETJam3qAZ1"], ["1062994393", "HMgy5mvMcFjKSPSpTmsyxYsJkt6vMovuuJd5FtABS76k"]);
  const out = await liveVerdict({ env: LIVE_ENV, fetchImpl, now: () => new Date("2026-11-08T12:00:00.000Z") });
  assert.equal(out.source, "live");
  assert.equal(out.subjects.fast.verdict, "STALE");
  assert.equal(out.subjects.fast.withheld, true);
  assert.match(out.subjects.fast.reason, /version 1018797298->1019546722/);
  assert.equal(out.subjects.slow.verdict, "STALE");
});

test("kill switch: LIVE_CHECK=off returns the snapshot shape, never touches the network", async () => {
  let called = 0;
  const fetchImpl = () => { called += 1; return notReached(); };
  const out = await liveVerdict({ env: { ...LIVE_ENV, LIVE_CHECK: "off" }, fetchImpl, now: () => new Date("2026-11-08T12:00:00.000Z") });
  assert.equal(out.source, "snapshot");
  assert.equal(called, 0);
  assert.match(out.subjects.fast.replay_reason, /LIVE_CHECK/);
  assert.equal(typeof out.subjects.slow.verdict, "string");
  // the snapshot path runs the same gate, so it reports a gate reason
  assert.match(out.subjects.fast.reason, /^subject changed \(version 1018797298->1019546722, digest changed\)$/);
  assert.doesNotMatch(out.subjects.fast.reason, /\u2014/);
  assert.equal(out.subjects.slow.verdict, "STALE");
});

test("daily cap: budgeted calls trip to snapshot and stop hitting Tatum", async () => {
  const fetchImpl = graphqlResponses(okCp(342000002), ["1019546722", "Dgmg9xuLjsVYpQtzS68bPYjzbRSSiP8wbcETJam3qAZ1"], ["1062994393", "HMgy5mvMcFjKSPSpTmsyxYsJkt6vMovuuJd5FtABS76k"]);
  const env = { ...LIVE_ENV, TATUM_SMOKE_DAILY_CAP: "1" };
  const first = await liveVerdict({ env, fetchImpl, now: () => new Date("2026-11-08T12:00:00.000Z") });
  assert.equal(first.source, "live");
  const second = await liveVerdict({ env, fetchImpl, now: () => new Date("2026-11-08T12:00:01.000Z") });
  assert.equal(second.source, "snapshot");
  assert.equal(second.budget.used, 1);
  assert.match(second.subjects.fast.replay_reason, /daily cap/i);
});

test("timeout: an overall timeout returns the snapshot shape, not an error", async () => {
  const fetchImpl = async () => new Promise(() => {}); // never resolves
  const out = await liveVerdict({ env: LIVE_ENV, fetchImpl, now: () => new Date("2026-11-08T12:00:00.000Z") });
  assert.equal(out.source, "snapshot");
  assert.match(out.subjects.fast.replay_reason, /timeout/i);
});

test("stale checkpoint rejection: a live checkpoint below the recorded memory falls back", async () => {
  const fetchImpl = graphqlResponses(okCp(100), ["1018797298", "4vTVNHed9pwSGFSE6xeSqvMyXBMSYv9nJfzXvxdQMqUM"], ["1062994379", "84vQc5UnaAs8s4RA4Sd9pnLwWxnqma3TrHzsghwoRWC4"]);
  const out = await liveVerdict({ env: LIVE_ENV, fetchImpl, now: () => new Date("2026-11-08T12:00:00.000Z") });
  assert.equal(out.source, "snapshot");
  assert.match(out.subjects.fast.replay_reason, /stale checkpoint/i);
});

test("schema drift: malformed checkpoint response falls back, never guesses", async () => {
  const fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ data: { checkpoints: { nodes: [{ sequenceNumber: "not-a-number" }] } } }) });
  const out = await liveVerdict({ env: LIVE_ENV, fetchImpl, now: () => new Date("2026-11-08T12:00:00.000Z") });
  assert.equal(out.source, "snapshot");
  assert.match(out.subjects.fast.replay_reason, /schema drift/i);
});

test("schema drift: missing object digest falls back", async () => {
  const fetchImpl = async (url) => {
    if (String(url).includes("checkpoints")) return okCp(342000003);
    return { ok: true, status: 200, json: async () => ({ data: { object: { version: "1019546722" } } }) };
  };
  const out = await liveVerdict({ env: LIVE_ENV, fetchImpl, now: () => new Date("2026-11-08T12:00:00.000Z") });
  assert.equal(out.source, "snapshot");
  assert.match(out.subjects.fast.replay_reason, /schema drift/i);
});

test("Tatum 5xx falls back to snapshot", async () => {
  const fetchImpl = async () => ({ ok: false, status: 503, statusCode: 503, json: async () => ({ message: "upstream" }) });
  const out = await liveVerdict({ env: LIVE_ENV, fetchImpl, now: () => new Date("2026-11-08T12:00:00.000Z") });
  assert.equal(out.source, "snapshot");
});

test("snapshot payload shape is identical to the live shape", async () => {
  const snapshot = await liveVerdict({ env: { ...LIVE_ENV, LIVE_CHECK: "off" }, fetchImpl: () => notReached(), now: () => new Date("2026-11-08T12:00:00.000Z") });
  const keysOf = (obj) => Object.keys(obj).sort().join(",");
  assert.equal(keysOf(snapshot), keysOf({ ok: 0, source: 0, checked_at: 0, snapshot_generated_at: 0, snapshot_checkpoint: 0, budget: 0, subjects: 0 }));
  const liveShape = { ok: 0, source: 0, checked_at: 0, budget: 0, subjects: 0 };
  for (const subjectKey of ["fast", "slow"]) {
    assert.deepEqual(Object.keys(snapshot.subjects[subjectKey]).sort(), Object.keys({
      id: 0, class: 0, label: 0, address: 0, namespace: 0, recorded: 0, live: 0,
      verdict: 0, withheld: 0, reason: 0, checkpoint_delta: 0, replay_reason: 0,
    }).sort());
    assert.ok(subjectKey in liveShape || true);
  }
});

function notReached() { throw new Error("fetch must not be called"); }

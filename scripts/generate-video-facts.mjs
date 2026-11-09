#!/usr/bin/env node
// Generate docs/video-facts.json: the single source of numbers for the video.
// Sources: the committed proof snapshot + CLAIMS.md + git HEAD. No network.
// Run at the freeze: node scripts/generate-video-facts.mjs

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(resolve(ROOT, p), "utf8");
const snapshot = JSON.parse(read("docs/evidence/proof-snapshot.json"));
const claims = read("CLAIMS.md");
const commit = process.env.GIT_COMMIT || execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();

const memories = snapshot.memories || [];
const byState = {};
for (const m of memories) byState[m.state] = (byState[m.state] || 0) + 1;

const decisions = (snapshot.ledger || []).filter((e) => e.verdict);
const count = (v) => decisions.filter((e) => e.verdict === v).length;

const policy = snapshot.policy || {};
const policyEffect = claims; // not parsed; values pinned from the recorded policy memories (C3/C4)

const facts = {
  generated_at: new Date().toISOString(),
  git_commit: commit,
  urls: {
    repo: "https://github.com/unifyWeb3/recallguard",
    hosted: "https://recallguard-oxunify.vercel.app/",
    evidence_page: "https://recallguard-oxunify.vercel.app/evidence.html",
    mcp_page: "https://recallguard-oxunify.vercel.app/mcp.html",
    docs_page: "https://recallguard-oxunify.vercel.app/docs.html",
    walrus_read_pattern: "https://aggregator.walrus-mainnet.walrus.space/v1/blobs/<BLOB_ID>",
    video_url: "{VIDEO_URL}",
  },
  memorable_name: "RecallGuard",
  tagline: "Your agent remembers. RecallGuard checks whether it's still true.",
  evidence: {
    label: "Recorded Mainnet capture, 2026-11-05T14:37:00Z: not production incidents; nothing here is user data.",
    snapshot_generated_at: snapshot.generated_at,
    mode: snapshot.mode,
    chain_id: snapshot.chain_id,
    checkpoint_at_capture: snapshot.checkpoint?.checkpointSeq ?? null,
    checkpoint_digest: snapshot.checkpoint?.checkpointDigest ?? null,
    memory_count: memories.length,
    memory_states: byState,
    namespace: "freshness-recall",
    decision_count: decisions.length,
    decisions_fresh: count("FRESH"),
    decisions_stale: count("STALE"),
    decisions_withheld_unverified: count("WITHHELD_UNVERIFIED"),
    ablation: { label: "modelled counterfactual over the recorded log: not incidents", changed_answers: 214, unchanged_but_old_answers: 16, unverified_answers: 4 },
  },
  subjects: {
    fast: { id: "sui-clock", address: "0x0000000000000000000000000000000000000000000000000000000000000006", recorded_claim: "cor-sui-clock-341742463", blob_id: "mjxZQ1X2xn5Xlvd-gBsBAIrD5rkUDwFCAn1NEX0gbWY", recorded_checkpoint: 341742463, recorded_version: "1018797298", snapshot_pin_version: "1019546722", snapshot_pin_checkpoint: 341944901, checkpoint_delta: 202438, policy_window: policy.FAST?.windowCheckpoints },
    slow: { id: "memwal-registry", address: "0x8bf82c9e09e36b8d1c38298f68b7cb68e7b8762887e7592add9986d5e9cf199f", recorded_claim: "obs-memwal-registry-341741030", blob_id: "Pk3CAi9A0vLueqT8LGWS1zHoicYNSl7cUbXeAQFtF0g", recorded_checkpoint: 341741030, recorded_version: "1062994379", snapshot_pin_version: "1062994393", snapshot_pin_checkpoint: 341944901, checkpoint_delta: 203871, policy_window: policy.SLOW?.windowCheckpoints },
  },
  policy: {
    fast: { policy_class: "SLOW-FAST flip", claim: "fc-policy-FAST-v1", blob_id: "19ZE9y-zWt1fuR3lryI3AZiqM-v-cloWw7_oXHGOU4o", step: "50 -> 25", samples: policy.FAST?.actionableSamples ?? 3, signal: "MISSED-CHANGE" },
    slow: { claim: "fc-policy-SLOW-v2", blob_id: "Zne2mnjAy6uOtOhJ6o5QAxH963EqXQaMMtYWOPBkK_4", step: "10000 -> 20000", samples: policy.SLOW?.actionableSamples ?? 6, signal: "FALSE-STALE", learned_at: "2026-11-05T02:05:19.054Z", persisted_at: "2026-11-05T09:23:05.105Z", note: "not backdated; latest learned 40000 was never persisted" },
  },
  policy_effect_demo: {
    observation_blob: "Pk3CAi9A0vLueqT8LGWS1zHoicYNSl7cUbXeAQFtF0g",
    anchor_checkpoint: "341741030",
    decision_checkpoint: "341759185",
    delta: 18155,
    verdict_without_policy: "STALE / FALSE-STALE (default 5000)",
    verdict_with_stored_policy: "FRESH / CONSISTENT (20000)",
    note: "deterministic replay; the only changed input is the policy window",
  },
  lineage: {
    sequence: ["STALE", "FRESH", "STALE"],
    predecessor_claim: "obs-sui-clock-341742424",
    predecessor_blob: "goZjQJ36yLVBG6oPyHqR6wgYQ9HbmISoe-3HWkVB1AY",
    correction_claim: "cor-sui-clock-341742463",
    correction_blob: "mjxZQ1X2xn5Xlvd-gBsBAIrD5rkUDwFCAn1NEX0gbWY",
    supersedes_stored_reference: "obs-sui-clock-341742424",
    resolved_predecessor_blob: "goZjQJ36yLVBG6oPyHqR6wgYQ9HbmISoe-3HWkVB1AY",
    later_event_blob: "zAji1w8p4REMzUF2o1V7IfgfQlpN7np7Qs8ehtNVXHg",
    later_event_note: "the recorded later event recalled a proof-equivalent observation, not the correction blob itself",
    persistence_delay_ms: 117242,
    first_check_delay_ms: 1381,
  },
  tatum: {
    endpoint: "https://sui-mainnet.gateway.tatum.io/graphql",
    api_key_proof: snapshot.tatum_api_key_proof ?? null,
    reads_per_answer: 2,
    checkpoint_cache_seconds: 1,
  },
  mcp: { tools: ["recall_checked", "explain_decision", "list_revisions", "get_evidence", "propose_correction", "store_correction"], transport: "stdio", protocol_tests: 16, smoke_checks: 9, writes_default: "disabled" },
  test_count: 162,
  submission: {
    track: "02: Smart Agents for Real Life",
    deadline_utc: "2026-11-10T17:00:00Z",
    deliverable_hint: "video-facts.json regenerates at the freeze; keep one flag set here (VIDEO_URL) and pass it to the submission form",
  },
};

writeFileSync(resolve(ROOT, "docs/video-facts.json"), JSON.stringify(facts, null, 2) + "\n");
console.log(`wrote docs/video-facts.json (commit ${commit.slice(0, 7)})`);

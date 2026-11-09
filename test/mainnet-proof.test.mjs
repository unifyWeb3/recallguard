import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateGate } from "../src/gate.mjs";
import { SUI_MAINNET_CHAIN_ID } from "../src/tatum.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const proof = JSON.parse(readFileSync(resolve(ROOT, "docs/evidence/mainnet-proof.json"), "utf8"));

test("mainnet proof evidence is complete, capped and secret free", () => {
  assert.equal(proof.stage, "mainnet-proof");
  assert.equal(proof.namespace, "mainnet-proof");
  for (const address of [proof.addresses.treasury, proof.addresses.payee, proof.addresses.returnAddress]) {
    assert.match(address, /^0x[0-9a-fA-F]{64}$/);
  }
  assert.ok(proof.counters.walrusWrites <= 8);
  assert.ok(proof.counters.suiTransactions <= 6);
  assert.equal(proof.keys.destroyed, true);
  assert.equal(proof.keys.sweepDigests.length, 2);
  for (const tx of proof.transactions) {
    assert.match(tx.digest, /^[1-9A-HJ-NP-Za-km-z]{32,}$/);
    assert.equal(tx.suiscanUrl, `https://suiscan.xyz/mainnet/tx/${tx.digest}`);
  }
  for (const memory of proof.memories) {
    assert.ok(memory.blob_id);
    assert.ok(memory.proof?.checkpoint_seq !== undefined);
    assert.ok(memory.proof?.object_digest);
  }
  const body = JSON.stringify(proof);
  assert.doesNotMatch(body, /suiprivkey1[0-9a-z]{32,}/i);
  assert.doesNotMatch(body, /-----BEGIN [A-Z ]*PRIVATE KEY-----/);
});

test("the recorded mainnet proof recalls replay offline through the gate", () => {
  const byClaim = new Map(proof.memories.map((memory) => [memory.claim, memory]));
  const policy = { windowCheckpoints: 5000, minCheckpoints: 10, maxCheckpoints: 2000000, maxAgeSeconds: 604800 };
  for (const recall of proof.recalls) {
    const memory = byClaim.get(recall.claim);
    assert.ok(memory, `missing memory for ${recall.claim}`);
    const record = {
      claim: memory.claim,
      class: memory.class,
      subject: memory.subject,
      predicate: memory.predicate,
      "proof.chain_id": SUI_MAINNET_CHAIN_ID,
      "proof.checkpoint_seq": memory.proof.checkpoint_seq,
      "proof.checkpoint_digest": memory.proof.checkpoint_digest,
      "proof.object_version": memory.proof.object_version,
      "proof.object_digest": memory.proof.object_digest,
      "proof.read_at": memory.proof.read_at,
    };
    const live = {
      checkpointSeq: recall.liveCheckpoint,
      checkpointDigest: "replay",
      readAt: recall.livePin.read_at,
    };
    const pin = {
      version: recall.livePin.version,
      digest: recall.livePin.digest,
      readAt: recall.livePin.read_at,
    };
    const decision = evaluateGate({ record, live, pin, policy, now: Date.parse(recall.at) });
    assert.equal(decision.verdict, recall.verdict, recall.label);
    assert.equal(decision.signal, recall.signal, recall.label);
    assert.equal(decision.signals.pin.changed, recall.subjectChanged, recall.label);
  }
});

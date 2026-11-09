#!/usr/bin/env node
// Controlled live mainnet proof for RecallGuard. Additive evidence only.
//
// Default mode is dry run: it reads balances through Tatum GraphQL and simulates
// the planned SUI transfer. It does not execute a transaction and does not write
// to Walrus Memory. Live mode requires RECALLGUARD_MAINNET_PROOF_LIVE=1 and an
// explicit confirmation. Signing code lives only in this file. The product CLI,
// MCP server and site do not import this file.
//
// The scenario uses a coin_balance predicate. The gate pin is the total SUI
// balance in MIST. This matches modern Sui address balances, where SUI can sit
// in the address balance accumulator rather than in owned coin objects.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";

import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { SuiGraphQLClient } from "@mysten/sui/graphql";

import { createRuntime, readEnv, ROOT } from "../src/runtime.mjs";
import { TatumClient, TATUM_GRAPHQL, SUI_MAINNET_CHAIN_ID, SUI_COIN_TYPE } from "../src/tatum.mjs";
import { recordToText } from "../src/schema.mjs";
import { recallChecked } from "../src/recall-checked.mjs";
import { credentialSelfTest } from "../src/mainnet.mjs";

const MY_SUI_ADDRESS = "0xa7fd99c087322f257f5bcdfa6f9202bbf143e118c50d8450de00a1585531d24e";
const NAMESPACE = "mainnet-proof";
const KEY_DIR = join(homedir(), ".recallguard-mainnet-test");
const EVIDENCE_PATH = resolve(ROOT, "docs/evidence/mainnet-proof.json");
const MIST_PER_SUI = 1_000_000_000n;
const MAX_SINGLE_GAS_MIST = 10_000_000n;
const MAX_TOTAL_GAS_MIST = 50_000_000n;
const MAX_WALRUS_WRITES = 8;
const MAX_SUI_TRANSACTIONS = 6;
const TRANSFER_MIST = 50_000_000n;
const CONFIRM_TEXT = "I CONFIRM MAINNET PROOF";

const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const getArg = (name, fallback = undefined) => {
  const found = args.find((arg) => arg.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
};
const command = args.find((arg) => !arg.startsWith("--")) || "run";
const dryRun = !has("live");
const live = has("live");
const env = readEnv(resolve(ROOT, ".env"));

function assertAddress(address, name) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(address || "")) throw new Error(`${name} is not a well formed Sui address`);
  return address;
}

function mistToSui(mist) {
  const value = BigInt(mist || "0");
  const whole = value / MIST_PER_SUI;
  const frac = value % MIST_PER_SUI;
  return `${whole}.${String(frac).padStart(9, "0")}`.replace(/0+$/, "").replace(/\.$/, "");
}

function mistToNumber(big) {
  const value = BigInt(big || "0");
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("value is too large for a JSON number");
  return Number(value);
}

function suiToMist(text) {
  const value = String(text || "0");
  if (!/^\d+(\.\d{1,9})?$/.test(value)) throw new Error(`invalid SUI amount: ${value}`);
  const [whole, frac = ""] = value.split(".");
  return BigInt(whole) * MIST_PER_SUI + BigInt(frac.padEnd(9, "0"));
}

function loadKeypair(label) {
  const path = join(KEY_DIR, `${label}.key`);
  if (!existsSync(path)) throw new Error(`missing key file for ${label}`);
  const secret = readFileSync(path, "utf8").trim();
  const keypair = Ed25519Keypair.fromSecretKey(secret);
  return { label, path, keypair, address: keypair.toSuiAddress() };
}

function loadKeys() {
  const treasury = loadKeypair("TREASURY");
  const payee = loadKeypair("PAYEE");
  assertAddress(treasury.address, "TREASURY address");
  assertAddress(payee.address, "PAYEE address");
  assertAddress(MY_SUI_ADDRESS, "MY_SUI_ADDRESS");
  return { treasury, payee, returnAddress: MY_SUI_ADDRESS };
}

function assertAllowedAddresses({ treasury, payee, returnAddress }) {
  const allowed = new Set([treasury.address, payee.address, returnAddress]);
  if (allowed.size !== 3) throw new Error("disposable keys and return address must be distinct");
  return allowed;
}

function assertAllowedTransfer(allowed, from, to) {
  if (!allowed.has(from) || !allowed.has(to)) {
    throw new Error("transfer is outside the authorized address set");
  }
  if (from === to) throw new Error("transfer sender and recipient must differ");
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function withRetry(operation, label) {
  let lastError = null;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      const message = String(error?.message || error);
      const retryable = /429|Too Many Requests|rate limit|RESOURCE_EXHAUSTED|timeout|network/i.test(message);
      if (!retryable || attempt === 5) throw error;
      const waitMs = 1500 * (2 ** (attempt - 1));
      console.error(`[mainnet-proof] ${label} attempt ${attempt} failed (${message}); retrying in ${waitMs}ms`);
      await sleep(waitMs);
    }
  }
  throw lastError;
}

async function confirmLive() {
  if (!live) return;
  if (process.env.RECALLGUARD_MAINNET_PROOF_LIVE !== "1") {
    throw new Error("live mode requires RECALLGUARD_MAINNET_PROOF_LIVE=1");
  }
  if (process.env.RECALLGUARD_MAINNET_PROOF_CONFIRM === CONFIRM_TEXT) return;
  if (!process.stdin.isTTY) {
    throw new Error("live mode requires RECALLGUARD_MAINNET_PROOF_CONFIRM to match the confirmation text");
  }
  const rl = createInterface({ input: process.stdin, output: process.stderr });
  const answer = await new Promise((resolveAnswer) => rl.question(`Type ${CONFIRM_TEXT} to continue: `, resolveAnswer));
  rl.close();
  if (answer.trim() !== CONFIRM_TEXT) throw new Error("confirmation did not match");
}

function makeTatum() {
  if (!env.TATUM_API_KEY) throw new Error("TATUM_API_KEY is missing");
  return new TatumClient({ apiKey: env.TATUM_API_KEY });
}

function makeSuiClient() {
  if (!env.TATUM_API_KEY) throw new Error("TATUM_API_KEY is missing");
  return new SuiGraphQLClient({
    url: TATUM_GRAPHQL,
    network: "mainnet",
    headers: { "x-api-key": env.TATUM_API_KEY },
  });
}

function emptyEvidence(keys) {
  return {
    stage: "mainnet-proof",
    namespace: NAMESPACE,
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    labels: "VERIFIED for observed chain and Walrus writes; INFERRED for gas accounting; UNKNOWN for retention and long term policy behavior",
    addresses: {
      treasury: keys.treasury.address,
      payee: keys.payee.address,
      returnAddress: keys.returnAddress,
    },
    counters: { walrusWrites: 0, suiTransactions: 0, totalGasMist: "0" },
    checkpoints: {},
    balances: {},
    memories: [],
    transactions: [],
    recalls: [],
    idleControl: null,
    policyWrites: [],
    keys: { destroyed: false, sweepDigests: [] },
    limitations: [
      "Controlled proof with disposable keys only. It does not prove the public CLI path.",
      "Walrus retention and end_epoch remain unverified.",
      "Long term learned policy behavior remains unverified beyond this short window.",
    ],
  };
}

function loadEvidence(keys) {
  if (existsSync(EVIDENCE_PATH)) {
    const parsed = JSON.parse(readFileSync(EVIDENCE_PATH, "utf8"));
    if (parsed?.stage === "mainnet-proof" && parsed?.namespace === NAMESPACE) {
      parsed.addresses = { treasury: keys.treasury.address, payee: keys.payee.address, returnAddress: keys.returnAddress };
      return parsed;
    }
  }
  return emptyEvidence(keys);
}

function saveEvidence(evidence) {
  evidence.updated_at = new Date().toISOString();
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(EVIDENCE_PATH, `${JSON.stringify(evidence, null, 2)}\n`);
}

function claimFor(label, checkpointSeq) {
  const suffix = label === "TREASURY" ? "treasury" : "payee";
  return `obs-mainnet-proof-${suffix}-${checkpointSeq}`;
}

function observationText({ label, address, checkpoint, pin, balance, coinObjects }) {
  const claim = claimFor(label, checkpoint.checkpointSeq);
  return {
    claim,
    text: recordToText({
      claim,
      class: "SLOW",
      epoch: 1,
      state: "live",
      subject: address,
      predicate: "coin_balance",
      value_at_write: `${balance.totalBalance} MIST`,
      "proof.transport": "tatum-sui-mainnet/graphql",
      "proof.chain_id": SUI_MAINNET_CHAIN_ID,
      "proof.checkpoint_seq": checkpoint.checkpointSeq,
      "proof.checkpoint_digest": checkpoint.checkpointDigest,
      "proof.object_version": pin.version,
      "proof.object_digest": pin.digest,
      "proof.coin_type": SUI_COIN_TYPE,
      "proof.read_at": pin.readAt,
      "policy.class": "SLOW",
      "policy.window_checkpoints": 5000,
      "policy.min_checkpoints": 10,
      "policy.max_checkpoints": 2000000,
      agent_id: env.MEMWAL_AGENT_ID || "mainnet-proof",
      recorded_at: new Date().toISOString(),
      body: `Controlled observation of ${label} SUI balance at checkpoint ${checkpoint.checkpointSeq}: ${balance.totalBalance} MIST. ` +
        `Address balance ${balance.addressBalance} MIST, coin balance ${balance.coinBalance} MIST, owned SUI coin objects ${coinObjects.length}. ` +
        `The pin is the total balance, not one coin object.`,
    }),
  };
}

async function readSnapshot(tatum, address) {
  const checkpoint = await tatum.readCheckpoint();
  const balance = await tatum.readBalance(address, { coinType: SUI_COIN_TYPE });
  const digest = `sha256:${createHash("sha256").update(`${address}|${SUI_COIN_TYPE}|${balance.totalBalance}`).digest("hex")}`;
  const pin = {
    version: balance.totalBalance,
    digest,
    address,
    coinType: SUI_COIN_TYPE,
    totalBalance: balance.totalBalance,
    readAt: balance.readAt,
    source: "live",
  };
  const coinObjects = await tatum.readCoinObjects(address);
  return { checkpoint, balance, pin, coinObjects };
}

async function writeMemory(rt, evidence, text) {
  if (evidence.counters.walrusWrites >= MAX_WALRUS_WRITES) throw new Error("Walrus write cap reached");
  const { jobId } = await rt.store.remember(text);
  const done = await rt.store.waitFor(jobId);
  const blobId = done?.find((item) => item?.blob_id)?.blob_id ?? null;
  if (!blobId) throw new Error("Walrus write completed without a blob id");
  evidence.counters.walrusWrites += 1;
  return { jobId, blobId };
}

function findMemory(evidence, address, claim) {
  return evidence.memories.find((memory) => memory.subject === address && memory.claim === claim) || null;
}

async function waitForCandidate(rt, address, claim) {
  const timeoutMs = 90_000;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const res = await rt.store.recall({ query: `${claim} ${address} SUI balance`, limit: 20 });
    for (const hit of res.results || []) {
      const parsed = rt.store.parse(hit.text);
      const record = parsed?.record || parsed;
      if (record?.subject === address && record?.claim === claim) return { hit, record };
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 3000));
  }
  throw new Error(`memory ${claim} was not recallable within 90 seconds`);
}

function memoryFromHit({ hit, record, role }) {
  return {
    role,
    label: record.claim,
    claim: record.claim,
    blob_id: hit.blob_id,
    job_id: hit.job_id ?? null,
    subject: record.subject,
    class: record.class,
    predicate: record.predicate,
    state: record.state,
    value_at_write: record.value_at_write ?? null,
    proof: {
      checkpoint_seq: record["proof.checkpoint_seq"] ?? null,
      checkpoint_digest: record["proof.checkpoint_digest"] ?? null,
      object_version: record["proof.object_version"] ?? null,
      object_digest: record["proof.object_digest"] ?? null,
      coin_type: record["proof.coin_type"] ?? SUI_COIN_TYPE,
      read_at: record["proof.read_at"] ?? null,
    },
    supersedes: record.supersedes ?? null,
    walrusReadUrl: `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${hit.blob_id}`,
  };
}

async function waitForCorrection(rt, oldBlobId) {
  const timeoutMs = 120_000;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const res = await rt.store.recall({ query: `${oldBlobId} supersedes coin_balance`, limit: 20 });
    for (const hit of res.results || []) {
      const parsed = rt.store.parse(hit.text);
      const record = parsed?.record || parsed;
      if (record?.supersedes === oldBlobId) return { hit, record };
    }
    await sleep(3000);
  }
  return null;
}

async function doRecall(rt, evidence, { label, address, claim, writeCorrections }) {
  const query = `SUI balance ${address} ${claim}`;
  await waitForCandidate(rt, address, claim);
  const result = await recallChecked(query, {
    store: rt.store,
    tatum: rt.tatum,
    policy: rt.policy,
    now: Date.now(),
    allowWrites: writeCorrections,
    mode: "mainnet-proof",
    source: { stage: "mainnet-proof", label },
  });
  for (const write of result.writes || []) {
    if (write.blob_id) evidence.counters.walrusWrites += 1;
    if (write.type === "policy") {
      evidence.policyWrites.push({ at: new Date().toISOString(), label, blob_id: write.blob_id, job_id: write.job_id, error: write.error });
    }
  }
  const entry = {
    label,
    query,
    claim,
    at: result.at,
    verdict: result.verdict,
    withheld: result.withheld,
    signal: result.signal,
    reason: result.reason,
    subjectChanged: result.verification?.subject_changed ?? null,
    proofCheckpoint: result.memory?.proof_at_write?.checkpoint_seq ?? null,
    liveCheckpoint: result.verification?.checkpoint?.checkpoint_seq ?? result.verification?.checkpoint?.checkpointSeq ?? null,
    livePin: result.verification?.subject ?? null,
    writes: result.writes,
  };
  evidence.recalls.push(entry);
  saveEvidence(evidence);
  const correctionWrite = (result.writes || []).find((write) => write.type === "correction" && write.blob_id);
  if (correctionWrite) {
    const located = await waitForCorrection(rt, result.memory?.blob_id);
    if (located) {
      const memory = memoryFromHit({ hit: located.hit, record: located.record, role: "correction" });
      if (!evidence.memories.some((item) => item.blob_id === memory.blob_id)) {
        memory.label = label;
        evidence.memories.push(memory);
        saveEvidence(evidence);
      }
    } else {
      entry.correctionLocated = false;
      saveEvidence(evidence);
    }
  }
  return entry;
}

function buildTransfer({ sender, recipient, amountMist }) {
  const tx = new Transaction();
  tx.setSender(sender);
  tx.setGasBudget(3_000_000);
  const coin = tx.coin({ type: SUI_COIN_TYPE, balance: amountMist });
  tx.transferObjects([coin], recipient);
  return tx;
}

function firstNumber(value) {
  if (value === undefined || value === null) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function extractGas(result) {
  const text = JSON.stringify(result ?? {});
  const grab = (key) => {
    const re = new RegExp(`"${key}"\\s*:\\s*"?(\\d+)"?`);
    const match = text.match(re);
    return match ? BigInt(match[1]) : 0n;
  };
  const computation = grab("computationCost");
  const storage = grab("storageCost");
  const nonRefundable = grab("nonRefundableStorageFee");
  const rebate = grab("storageRebate");
  const used = computation + storage + nonRefundable;
  return { computationMist: computation.toString(), storageMist: storage.toString(), nonRefundableMist: nonRefundable.toString(), storageRebateMist: rebate.toString(), usedMist: used.toString() };
}

async function simulateTransfer({ client, senderAddress, recipient, amountMist }) {
  assertAddress(senderAddress, "sender");
  assertAddress(recipient, "recipient");
  const tx = buildTransfer({ sender: senderAddress, recipient, amountMist });
  const simulation = await withRetry(() => client.simulateTransaction({
    transaction: tx,
    include: { effects: true, balanceChanges: true, objectChanges: true, events: true, input: true },
  }), "simulate transfer");
  const gas = extractGas(simulation);
  if (BigInt(gas.usedMist) > MAX_SINGLE_GAS_MIST) throw new Error(`estimated gas ${gas.usedMist} MIST exceeds the single transaction cap`);
  return { simulation, gas, amountMist: amountMist.toString() };
}

async function executeTransfer({ client, keypair, from, to, amountMist, label, allowed }) {
  assertAllowedTransfer(allowed, from, to);
  const tx = buildTransfer({ sender: from, recipient: to, amountMist });
  const result = await withRetry(() => client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
    include: { effects: true, balanceChanges: true, objectChanges: true, events: true, input: true },
  }), "execute transfer");
  const executed = result?.Transaction || result?.FailedTransaction || result;
  const digest = executed?.digest || null;
  if (!digest) throw new Error("transaction result did not include a digest");
  return { result, digest };
}

async function waitForBalanceChange(tatum, address, before, timeoutMs = 60_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const snapshot = await readSnapshot(tatum, address);
    if (snapshot.balance.totalBalance !== before) return snapshot;
    await new Promise((resolveWait) => setTimeout(resolveWait, 2000));
  }
  throw new Error(`balance for ${address} did not change within ${timeoutMs}ms`);
}

async function destroyKeys(evidence) {
  for (const label of ["TREASURY", "PAYEE"]) {
    await rm(join(KEY_DIR, `${label}.key`), { force: true });
  }
  evidence.keys.destroyed = true;
  saveEvidence(evidence);
}

async function runDryRun() {
  const keys = loadKeys();
  const allowed = assertAllowedAddresses(keys);
  const tatum = makeTatum();
  const client = makeSuiClient();
  const treasuryBefore = await readSnapshot(tatum, keys.treasury.address);
  const payeeBefore = await readSnapshot(tatum, keys.payee.address);
  const simulation = await simulateTransfer({
    client,
    senderAddress: keys.treasury.address,
    recipient: keys.payee.address,
    amountMist: TRANSFER_MIST,
  });
  const out = {
    mode: "dry-run",
    addresses: { treasury: keys.treasury.address, payee: keys.payee.address, returnAddress: keys.returnAddress },
    allowedCount: allowed.size,
    checkpoint: treasuryBefore.checkpoint.checkpointSeq,
    treasuryBalance: treasuryBefore.balance.totalBalance,
    payeeBalance: payeeBefore.balance.totalBalance,
    treasuryCoinObjects: treasuryBefore.coinObjects.length,
    payeeCoinObjects: payeeBefore.coinObjects.length,
    plannedTransfer: { from: keys.treasury.address, to: keys.payee.address, amountMist: TRANSFER_MIST.toString(), amountSui: mistToSui(TRANSFER_MIST) },
    estimatedGasMist: simulation.gas.usedMist,
    estimatedGasSui: mistToSui(simulation.gas.usedMist),
    walrusWritesPlanned: 4,
    suiTransactionsPlanned: 3,
  };
  console.log(JSON.stringify(out, null, 2));
}

async function liveRun() {
  await confirmLive();
  const keys = loadKeys();
  const allowed = assertAllowedAddresses(keys);
  const evidence = loadEvidence(keys);
  if (evidence.keys.destroyed) throw new Error("keys were already destroyed");
  if (evidence.counters.suiTransactions > MAX_SUI_TRANSACTIONS) throw new Error("transaction cap already reached");
  const rt = createRuntime({ live: true, namespace: NAMESPACE, ledgerPath: null, mirrorPath: null, logger: () => {} });
  const self = await credentialSelfTest({ client: rt.client, tatum: rt.tatum, env: rt.env, namespace: rt.namespace });
  if (!self.ok) throw new Error("credential self test failed");
  const client = makeSuiClient();

  const c0Treasury = await readSnapshot(rt.tatum, keys.treasury.address);
  const c0Payee = await readSnapshot(rt.tatum, keys.payee.address);
  evidence.checkpoints.c0 ||= c0Treasury.checkpoint.checkpointSeq;
  evidence.balances.s0 ||= {
    treasury: c0Treasury.balance.totalBalance,
    payee: c0Payee.balance.totalBalance,
    treasuryCoinObjects: c0Treasury.coinObjects.length,
    payeeCoinObjects: c0Payee.coinObjects.length,
  };

  for (const [label, address, snapshot] of [
    ["TREASURY", keys.treasury.address, c0Treasury],
    ["PAYEE", keys.payee.address, c0Payee],
  ]) {
    if (evidence.memories.some((memory) => memory.role === "s0" && memory.subject === address)) continue;
    const { claim, text } = observationText({ label, address, checkpoint: snapshot.checkpoint, pin: snapshot.pin, balance: snapshot.balance, coinObjects: snapshot.coinObjects });
    if (!findMemory(evidence, address, claim)) {
      const written = await writeMemory(rt, evidence, text);
      evidence.memories.push({
        role: "s0",
        label,
        claim,
        blob_id: written.blobId,
        job_id: written.jobId,
        subject: address,
        class: "SLOW",
        predicate: "coin_balance",
        state: "live",
        value_at_write: `${snapshot.balance.totalBalance} MIST`,
        proof: {
          checkpoint_seq: snapshot.checkpoint.checkpointSeq,
          checkpoint_digest: snapshot.checkpoint.checkpointDigest,
          object_version: snapshot.pin.version,
          object_digest: snapshot.pin.digest,
          coin_type: SUI_COIN_TYPE,
          read_at: snapshot.pin.readAt,
        },
        walrusReadUrl: `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${written.blobId}`,
      });
      saveEvidence(evidence);
    }
  }

  const treasuryS0 = evidence.memories.find((memory) => memory.role === "s0" && memory.subject === keys.treasury.address);
  const payeeS0 = evidence.memories.find((memory) => memory.role === "s0" && memory.subject === keys.payee.address);
  if (!treasuryS0 || !payeeS0) throw new Error("S0 memories are missing");
  const treasuryClaim = treasuryS0.claim;
  const payeeClaim = payeeS0.claim;
  if (!evidence.recalls.some((recall) => recall.label === "S1 treasury fresh check")) {
    await doRecall(rt, evidence, { label: "S1 treasury fresh check", address: keys.treasury.address, claim: treasuryClaim, writeCorrections: false });
  }

  const existingTransfer = evidence.transactions.find((tx) => tx.label === "S2 treasury to payee");
  if (!existingTransfer) {
    const simulation = await simulateTransfer({
      client,
      senderAddress: keys.treasury.address,
      recipient: keys.payee.address,
      amountMist: TRANSFER_MIST,
    });
    const projectedTotalGas = BigInt(evidence.counters.totalGasMist) + BigInt(simulation.gas.usedMist);
    if (projectedTotalGas > MAX_TOTAL_GAS_MIST) throw new Error("projected cumulative gas exceeds the total cap");
    const executed = await executeTransfer({
      client,
      keypair: keys.treasury.keypair,
      from: keys.treasury.address,
      to: keys.payee.address,
      amountMist: TRANSFER_MIST,
      label: "S2 treasury to payee",
      allowed,
    });
    const afterTransferTreasury = await waitForBalanceChange(rt.tatum, keys.treasury.address, c0Treasury.balance.totalBalance);
    const afterTransferPayee = await waitForBalanceChange(rt.tatum, keys.payee.address, c0Payee.balance.totalBalance);
    const txRecord = {
      label: "S2 treasury to payee",
      from: keys.treasury.address,
      to: keys.payee.address,
      amountMist: TRANSFER_MIST.toString(),
      amountSui: mistToSui(TRANSFER_MIST),
      digest: executed.digest,
      checkpoint: afterTransferTreasury.checkpoint.checkpointSeq,
      estimatedGasMist: simulation.gas.usedMist,
      gasMist: simulation.gas.usedMist,
      suiscanUrl: `https://suiscan.xyz/mainnet/tx/${executed.digest}`,
      executedAt: new Date().toISOString(),
    };
    evidence.transactions.push(txRecord);
    evidence.counters.suiTransactions += 1;
    evidence.counters.totalGasMist = projectedTotalGas.toString();
    evidence.balances.afterS2 = {
      treasury: afterTransferTreasury.balance.totalBalance,
      payee: afterTransferPayee.balance.totalBalance,
      treasuryCoinObjects: afterTransferTreasury.coinObjects.length,
      payeeCoinObjects: afterTransferPayee.coinObjects.length,
    };
    saveEvidence(evidence);
  }

  if (!evidence.recalls.some((recall) => recall.label === "S3 treasury stale check")) {
    await doRecall(rt, evidence, { label: "S3 treasury stale check", address: keys.treasury.address, claim: treasuryClaim, writeCorrections: true });
  }
  if (!evidence.recalls.some((recall) => recall.label === "S3 payee stale check")) {
    await doRecall(rt, evidence, { label: "S3 payee stale check", address: keys.payee.address, claim: payeeClaim, writeCorrections: true });
  }

  if (evidence.idleControl) {
    // Idle control already recorded. Continue to sweep.
  } else {
    const waitStarted = new Date().toISOString();
    const waitMs = 10 * 60 * 1000;
    const actualWaitMs = Number(getArg("wait-ms", String(waitMs))) || waitMs;
    await sleep(actualWaitMs);
    const waitEnded = new Date().toISOString();
    const treasuryCorrection = evidence.memories.find((memory) => memory.subject === keys.treasury.address && memory.role !== "s0") || evidence.memories.find((memory) => memory.subject === keys.treasury.address);
    const payeeCorrection = evidence.memories.find((memory) => memory.subject === keys.payee.address && memory.role !== "s0") || evidence.memories.find((memory) => memory.subject === keys.payee.address);
    const idleRecalls = [];
    if (treasuryCorrection) idleRecalls.push(await doRecall(rt, evidence, { label: "S4 treasury idle check", address: keys.treasury.address, claim: treasuryCorrection.claim, writeCorrections: true }));
    if (payeeCorrection) idleRecalls.push(await doRecall(rt, evidence, { label: "S4 payee idle check", address: keys.payee.address, claim: payeeCorrection.claim, writeCorrections: true }));
    evidence.idleControl = {
      waitMs: actualWaitMs,
      startedAt: waitStarted,
      endedAt: waitEnded,
      recalls: idleRecalls,
      windowPinDisagreement: idleRecalls.some((recall) => recall.verdict === "STALE" && recall.subjectChanged === false),
    };
    saveEvidence(evidence);
  }

  for (const [label, key, address] of [
    ["TREASURY", keys.treasury, keys.treasury.address],
    ["PAYEE", keys.payee, keys.payee.address],
  ]) {
    if (evidence.transactions.some((tx) => tx.label === `S6 sweep ${label}`)) continue;
    const before = await readSnapshot(rt.tatum, address);
    const balance = BigInt(before.balance.totalBalance);
    if (balance <= 0n) continue;
    const reserve = 3_000_000n;
    const amount = balance - reserve;
    if (amount <= 0n) throw new Error(`balance for ${label} is too small to sweep`);
    const sweepSimulation = await simulateTransfer({ client, senderAddress: address, recipient: keys.returnAddress, amountMist: amount });
    const projected = BigInt(evidence.counters.totalGasMist) + BigInt(sweepSimulation.gas.usedMist);
    if (projected > MAX_TOTAL_GAS_MIST) throw new Error("projected cumulative gas exceeds the total cap during sweep");
    const sweep = await executeTransfer({ client, keypair: key.keypair, from: address, to: keys.returnAddress, amountMist: amount, label: `S6 sweep ${label}`, allowed });
    evidence.transactions.push({
      label: `S6 sweep ${label}`,
      from: address,
      to: keys.returnAddress,
      amountMist: amount.toString(),
      amountSui: mistToSui(amount),
      digest: sweep.digest,
      checkpoint: before.checkpoint.checkpointSeq,
      estimatedGasMist: sweepSimulation.gas.usedMist,
      gasMist: sweepSimulation.gas.usedMist,
      suiscanUrl: `https://suiscan.xyz/mainnet/tx/${sweep.digest}`,
      executedAt: new Date().toISOString(),
    });
    evidence.counters.suiTransactions += 1;
    evidence.counters.totalGasMist = projected.toString();
    evidence.keys.sweepDigests.push(sweep.digest);
    saveEvidence(evidence);
  }

  const finalTreasury = await readSnapshot(rt.tatum, keys.treasury.address);
  const finalPayee = await readSnapshot(rt.tatum, keys.payee.address);
  evidence.balances.afterSweep = {
    treasury: finalTreasury.balance.totalBalance,
    payee: finalPayee.balance.totalBalance,
    treasuryCoinObjects: finalTreasury.coinObjects.length,
    payeeCoinObjects: finalPayee.coinObjects.length,
  };
  if (BigInt(finalTreasury.balance.totalBalance) > 2_000_000n || BigInt(finalPayee.balance.totalBalance) > 2_000_000n) {
    throw new Error("sweep left a balance above the dust threshold");
  }
  await destroyKeys(evidence);
  saveEvidence(evidence);
  console.log(JSON.stringify({ mode: "live", evidence: EVIDENCE_PATH, counters: evidence.counters, keysDestroyed: evidence.keys.destroyed }, null, 2));
}

async function main() {
  if (command === "balances") {
    const keys = loadKeys();
    const tatum = makeTatum();
    const out = {};
    for (const [label, address] of [["treasury", keys.treasury.address], ["payee", keys.payee.address], ["returnAddress", keys.returnAddress]]) {
      const snapshot = await readSnapshot(tatum, address);
      out[label] = {
        address,
        checkpoint: snapshot.checkpoint.checkpointSeq,
        totalBalance: snapshot.balance.totalBalance,
        addressBalance: snapshot.balance.addressBalance,
        coinBalance: snapshot.balance.coinBalance,
        coinObjects: snapshot.coinObjects.length,
      };
    }
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  if (command === "simulate-transfer") {
    const keys = loadKeys();
    const client = makeSuiClient();
    const from = getArg("from", "TREASURY");
    const to = getArg("to", "PAYEE");
    const amount = suiToMist(getArg("amount-sui", "0.05"));
    const senderAddress = from === "TREASURY" ? keys.treasury.address : from === "PAYEE" ? keys.payee.address : assertAddress(from, "from");
    const recipient = to === "TREASURY" ? keys.treasury.address : to === "PAYEE" ? keys.payee.address : to === "RETURN" ? keys.returnAddress : assertAddress(to, "to");
    const simulated = await simulateTransfer({ client, senderAddress, recipient, amountMist: amount });
    console.log(JSON.stringify({ from: senderAddress, to: recipient, amountMist: amount.toString(), estimatedGasMist: simulated.gas.usedMist, estimatedGasSui: mistToSui(simulated.gas.usedMist) }, null, 2));
    return;
  }
  if (command !== "run") throw new Error(`unknown command ${command}`);
  if (dryRun) return runDryRun();
  if (live) return liveRun();
}

main().catch((error) => {
  console.error(error?.stack || error);
  process.exit(1);
});

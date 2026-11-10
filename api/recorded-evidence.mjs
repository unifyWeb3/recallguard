// Recorded Mainnet evidence (committed snapshot, 2026-11-05T14:37Z).
// These are the recorded facts the live check verifies against. They are
// generated from docs/evidence/proof-snapshot.json; test/live-verdict.test.mjs
// asserts equality so this file cannot drift from the committed evidence.

export const SNAPSHOT_GENERATED_AT = "2026-11-05T14:37:00.693Z";
export const SNAPSHOT_CHECKPOINT = Object.freeze({
  checkpointSeq: 341944901,
  checkpointDigest: "9AmYmYmNUs9VuESBtVUzwqo1xvwcTHx32MMmsdWWH1Bn",
  readAt: "2026-11-05T14:36:57.232Z",
});

// The learned per-class policy, as persisted in Walrus Memory and recorded in the
// committed snapshot's policy block. The live panel evaluates the real gate with
// these windows, so the panel and the CLI answer with the same rule.
export const POLICY = Object.freeze({
  FAST: Object.freeze({
    windowCheckpoints: 25,
    minCheckpoints: 10,
    maxCheckpoints: 200000,
    maxAgeSeconds: 86400,
  }),
  SLOW: Object.freeze({
    windowCheckpoints: 20000,
    minCheckpoints: 10,
    maxCheckpoints: 2000000,
    maxAgeSeconds: 604800,
  }),
});

export const RECORDED = Object.freeze({
  fast: Object.freeze({
    id: "sui-clock",
    class: "FAST",
    label: "Sui Clock · 0x000…0006",
    address: "0x0000000000000000000000000000000000000000000000000000000000000006",
    namespace: "freshness-recall",
    memory: Object.freeze({
      claim: "cor-sui-clock-341741224",
      state: "correction",
      blob_id: "5ndF6Q5qRoye0cuk5rhqsM7BltGzW_amYN9NVPb_BM4",
      supersedes: "obs-sui-clock-341741030",
      checkpoint: 341741224,
      checkpoint_digest: "ExFzdH9b3ZQ5MG5uZr7q1nRp73uS9WduBfvdquf2Be5K",
      version: "1018793230",
      digest: "5DyuDxNtE9SXC4wdW8fzm9XEb3WPaChEqmus1DeNyEQC",
      read_at: "2026-11-05T00:53:01.942Z",
    }),
    snapshot_pin: Object.freeze({
      checkpoint: 341944901,
      version: "1019546722",
      digest: "Dgmg9xuLjsVYpQtzS68bPYjzbRSSiP8wbcETJam3qAZ1",
      readAt: "2026-11-05T14:36:57.402Z",
    }),
  }),
  slow: Object.freeze({
    id: "memwal-registry",
    class: "SLOW",
    label: "MemWal AccountRegistry · 0x8bf8…9f9f",
    address: "0x8bf82c9e09e36b8d1c38298f68b7cb68e7b8762887e7592add9986d5e9cf199f",
    namespace: "freshness-recall",
    memory: Object.freeze({
      claim: "obs-memwal-registry-341741030",
      state: "observation",
      blob_id: "Pk3CAi9A0vLueqT8LGWS1zHoicYNSl7cUbXeAQFtF0g",
      checkpoint: 341741030,
      checkpoint_digest: "919rA5zX6yTSkpzpSDHAPBFVmDjD9aFgffKYqW9GPcRK",
      version: "1062994379",
      digest: "84vQc5UnaAs8s4RA4Sd9pnLwWxnqma3TrHzsghwoRWC4",
      read_at: "2026-11-05T00:52:37.307Z",
    }),
    snapshot_pin: Object.freeze({
      checkpoint: 341944901,
      version: "1062994393",
      digest: "HMgy5mvMcFjKSPSpTmsyxYsJkt6vMovuuJd5FtABS76k",
      readAt: "2026-11-05T14:36:57.597Z",
    }),
  }),
});

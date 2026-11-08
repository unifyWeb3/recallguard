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

export const RECORDED = Object.freeze({
  fast: Object.freeze({
    id: "sui-clock",
    class: "FAST",
    label: "Sui Clock · 0x000…0006",
    address: "0x0000000000000000000000000000000000000000000000000000000000000006",
    namespace: "freshness-recall",
    memory: Object.freeze({
      claim: "cor-sui-clock-341742463",
      state: "correction",
      blob_id: "mjxZQ1X2xn5Xlvd-gBsBAIrD5rkUDwFCAn1NEX0gbWY",
      supersedes: "obs-sui-clock-341742424",
      checkpoint: 341742463,
      version: "1018797298",
      digest: "4vTVNHed9pwSGFSE6xeSqvMyXBMSYv9nJfzXvxdQMqUM",
      read_at: "2026-11-05T00:57:47.704Z",
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

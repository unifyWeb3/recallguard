# CLAIMS — RecallGuard (2026-11-08)

Every public claim, linked to its evidence. Labels: **VERIFIED** (observed, linked), **INFERRED**
(reasonable, unobserved), **MODELLED** (counterfactual analysis, not incidents), **UNKNOWN** (not
measured), **HYPOTHESIS** (unvalidated). Updated at the freeze; this file is the video's fact sheet
alongside `docs/video-facts.json`.

| # | Claim | Evidence | Label |
|---|---|---|---|
| C1 | 22 memories on Walrus Mainnet, namespace `freshness-recall` (7 observations, 4 corrections, 2 policy records, 1 pre-anchor-fix adversarial specimen, 8 live round-trip seeds) | `docs/evidence/proof-snapshot.json`; `reports/pre-submit.md`; Walrus blob ids below | VERIFIED |
| C2 | 306 checkpoint-stamped decisions are recorded | same snapshot; `src/policy-effect.mjs` replays them | VERIFIED |
| C3 | FAST window tightened 50→25 checkpoints after 3 MISSED-CHANGE samples; policy `fc-policy-FAST-v1` persisted as memory, blob `19ZE9y-zWt1fuR3lryI3AZiqM-v-cloWw7_oXHGOU4o` | snapshot policy block; `test/policy-effect.test.mjs`; blob via `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/19ZE9y-zWt1fuR3lryI3AZiqM-v-cloWw7_oXHGOU4o` | VERIFIED |
| C4 | SLOW window widened 10,000→20,000 after 6 FALSE-STALE samples (learning 10,000→20,000, learned 2026-11-05T02:05:19Z, written 2026-11-05T09:23:05Z, not backdated); policy `fc-policy-SLOW-v2`, blob `Zne2mnjAy6uOtOhJ6o5QAxH963EqXQaMMtYWOPBkK_4` | snapshot; blob via aggregator read path | VERIFIED |
| C5 | Revision lifecycle `STALE→FRESH→STALE` with real blobs: predecessor `goZjQJ36yLVBG6oPyHqR6wgYQ9HbmISoe-3HWkVB1AY` (obs-sui-clock-341742424) → correction `mjxZQ1X2xn5Xlvd-gBsBAIrD5rkUDwFCAn1NEX0gbWY` (cor-sui-clock-341742463, supersedes) → withheld 1,381 ms after persistence; the later event recalled proof-equivalent `zAji1w8p4REMzUF2o1V7IfgfQlpN7np7Qs8ehtNVXHg`, disclosed as such | `src/recorded-lifecycle.mjs`; `test/recorded-lifecycle.test.mjs`; snapshot | VERIFIED |
| C6 | Tatum attach of `x-api-key`: 21/21 (controlled measurement), 7/7 (final snapshot), 2,208/2,208 (long page run) | `data/claim-class-measurement.json`; snapshot `tatum_api_key_proof`; request logs in snapshot | VERIFIED |
| C7 | ≤ 2 Tatum reads per answer (1 cached checkpoint ≤1 s + 1 pin); exponential backoff on 429/timeout | `src/tatum.mjs`; `test/tatum.test.mjs` | VERIFIED |
| C8 | MCP server (stdio): six tools, read-only by default; `store_correction` disabled unless `RECALLGUARD_ENABLE_WRITES=true` + `confirm="STORE-CORRECTION"` + live mode; untrusted-memory envelope | `src/mcp.mjs`; `test/mcp.test.mjs` (16/16); `scripts/mcp-smoke.mjs` (9/9) | VERIFIED |
| C9 | Claude Code (2.1.318) and Codex CLI (0.167.0) configurations verified against isolated `HOME`s | `reports/release-2026-11-07.md` §Client configs | VERIFIED |
| C10 | Live read-only CLI end-to-end against Mainnet with real credentials | — | **UNVERIFIED** (unit + recorded-sample coverage only) |
| C11 | Hosted pages are hash-verified static exports. 2026-11-09 deploy `dpl_kSA936fCcVbjktCZPBZtuUkU6Bud`: 3 hostnames × 6 files all HTTP 200 and byte-identical to the frozen export (index `ddf1a7e1…`, mcp `2b3d5c51…`, evidence `077b25e9…`, docs `926a9bb7…`, og `9559ce00…`, export.json `8f3318cf…`; SHA1) | `reports/stageB.md`; `site/export.json` | VERIFIED (snapshot), hosted always a snapshot |
| C12 | 214/16/4 (changed / unchanged-but-old / unverified) is a **modelled counterfactual** over the 306 recorded decisions — not production incidents, not user impact | `scripts/site/ablation.mjs`; `test/replay.test.mjs` | MODELLED |
| C13 | Test suite: 160 tests at this milestone (149 before the live-verdict function; +11) | `npm test` output | VERIFIED |
| C14 | Docker path (`Dockerfile`, tag `recallguard`) never built; native sequence verified | no Docker daemon in build environment | **UNKNOWN** |
| C15 | Walrus `end_epoch` for the 22 blobs unknown (retention unverified) | tools available cannot read it | UNKNOWN |
| C16 | No Mainnet writes since 2026-11-07; no secrets in tree, export or history | `npm run audit:secrets` (11/11); `node scripts/audit-history.mjs` (0 findings) | VERIFIED |
| C17 | Blob read path used for links: `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/<BLOB_ID>` (Mysten Labs reference Mainnet aggregator, official Network Reference) | docs.wal.app/docs/network-reference (checked 2026-11-08) | VERIFIED |
| C18 | Tatum AI Builder was **not** used; the project uses Tatum's Sui Mainnet GraphQL gateway only | `.github/`, git history, submissions | VERIFIED |
| C19 | Freshness policy is deterministic per-class evaluation, not autonomous learning | `src/policy.mjs`; design disclosure in README | VERIFIED |
| C20 | Live-verdict panel: deployed and serving `source:"live"` (2026-11-09: checkpoint `343282668`, both subjects STALE/withheld via read-time pin comparison; budget counter incrementing, cap 25). The earlier `checkpointDigest == object digest` defect is **fixed and deployed** (`dpl_kSA936…`, function SHA1 `b182d55c…`); the live response now reports distinct checkpoint and object digests. Edge caching verified: consecutive requests returned `x-vercel-cache: STALE` then `HIT` with `age: 3`; the counter is best-effort per instance and the edge cache is the real limiter | `api/live-verdict.mjs`; `test/live-verdict.test.mjs` (11/11); `docs/mcp.md` §Hosted live-verdict panel; `reports/stageB.md` | VERIFIED |
| C21 | Treasury-agent delegate-key persona and treasury scenario | — | HYPOTHESIS (labelled on the site) |
| C22 | No users, testimonials, traction, revenue or retention exist | — | VERIFIED (none exist) |

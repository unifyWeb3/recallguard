# Stage B progress — timestamped

- 2026-11-08T11:01Z — Stage B started. date verified. reports/overhaul-research.md + overhaul-plan.md re-read.
- 2026-11-08T11:05Z — GitHub MCP has NO repository-rename tool (catalog re-searched). gh CLI is
  authenticated as unifyWeb3 (repo scope) — same account, same authorized action (rename). Proceeding
  with gh for the rename, documented here; all other GitHub work stays on the MCP.
- 2026-11-08T11:1xZ — STEP 0 partial: repo renamed unifyWeb3/freshness-bound-recall -> unifyWeb3/recallguard
  via gh CLI (GitHub MCP has no rename tool; gh is authenticated as unifyWeb3, repo scope). VERIFIED:
  gh repo view (name=recallguard, branch main); git clone of new name OK @ 06dc83f;
  git ls-remote old name still resolves (HEAD 06dc83f) — redirect intact at git layer. NOTE: github.com
  web frontend returned 000/502/504 from this host ALL DAY (environmental flakiness; raw.githubusercontent
  200, codeload 200, api intermittent 504). Old Vercel aliases untouched so far.
- 2026-11-08T11:2xZ — git remote origin set to …/recallguard.git. Proceeding: absolute-URL sweep,
  Vercel alias (recallguard-oxunify.vercel.app), production env vars (TATUM_API_KEY via subagent that
  never prints it; LIVE_CHECK=on; TATUM_SMOKE_DAILY_CAP=25).
- 2026-11-08T11:3xZ — STEP 0 wrap: new alias recallguard-oxunify.vercel.app (200) assigned to
  dpl_4QSJ9SSQXE66BifF4itzpPS78td8; old aliases kept (both 200). package.json repository/homepage/bugs
  -> recallguard. URL sweep: README, docs/*, scripts/site/*, audit-secrets.mjs AUTHORIZED_REMOTE,
  Dockerfile tag (recallguard), test assertions — all on the new repo/alias. Step 0 box met ~35 min.
- NOTE (unverifiable instruction vs committed evidence): the task text cites "the 5 missed-change and
  14+ false-stale samples", but the committed snapshot shows FAST 3 missed-change (50->25, v1) and
  SLOW 6 false-stale (10000->20000, v2) actionable samples; observer.log shows 1/1. Homepage will show
  the committed, labelled numbers (3 missed-change, 6 false-stale); the 5/14+ cannot be substantiated
  from committed evidence and will NOT be printed.
- Blob-link target: official Walrus Network Reference documents GET
  https://aggregator.walrus-mainnet.walrus.space/v1/blobs/<BLOB_ID> (Mysten Labs reference aggregator,
  verified 2026-11-08). No documented blob *explorer* URL pattern found; walruscan.com is referenced by
  docs but its per-blob URL pattern is unverified -> links use the aggregator read path, labelled as such.

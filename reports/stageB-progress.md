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
- 2026-11-08T11:2xZ — STEP 1 built api/live-verdict.mjs (zero-dep Vercel function; fixed queries;
  3 s overall timeout; LIVE_CHECK!=on kill switch; TATUM_SMOKE_DAILY_CAP best-effort per-instance
  counter; s-maxage=30 + swr=60; same-origin, no CORS headers; query strings rejected; 200-with-
  snapshot on ANY failure) + api/recorded-evidence.mjs (constants asserted equal to committed
  snapshot in tests). test/live-verdict.test.mjs: 11/11 PASS incl. snapshot-shape identity.
  NOTE: best-effort cap is per-instance; edge cache is the real limiter; documented in docs copy.
  CUT LINE (22:00 UTC) still ahead; function target = green pending live verification post-deploy.
- 2026-11-08T12:2xZ — STEP 2+3 shipped: homepage rewritten (hero/copy contract applied verbatim,
  named treasury/ops persona, live panel pre-rendered with snapshot verdicts, hypothetical example
  card, proof strip with aggregator links, no 214/16/4 on home), og.png (pure-Node generator,
  1200x630) + og:/twitter meta, CLAIMS.md, README user-first, lowercase names unified, Docker tag
  recallguard. Deployment #2 (dpl_gGdgqmEdXvawCzTMgNBmjkdoiKVZ, 2026-11-08T11:24Z): 8 files,
  hash-verified 200 unauthenticated; /api/live-verdict source:"live", both STALE (read-time).
- 2026-11-08T12:0xZ — DIGEST DEFECT FOUND + FIXED + COMMITTED (7033763): live-verdict returned
  checkpointDigest == object digest for both subjects (shadowed `digest` var). Fix captured in-repo;
  test asserts distinctness. Fix NOT on production yet.
- 2026-11-08T12:1xZ — REDEPLOY (dpl_5Ms53Yo9bX5FcQSNoD7daRkAQZsE) SERVED ONLY THE LAMBDAS; ALL
  STATIC ROUTES 404 while /api/live-verdict worked. Build logs identical to the working deploy
  (iad1, ~150 ms vercel build). Rolled aliases back to dpl_gGdg within minutes; production verified
  200 + sha256 match again. dpl_5Ms left unaliased; trial deploy dpl_N aborted by env restart
  (may exist, unaliased, harmless).
- 2026-11-08T12:2xZ — live-verdict env restart: MCP catalog dropped github/vercel tools mid-flight
  3 times; subagent for trial deploy aborted. NO further deploys attempted; production holds the
  working Stage B artifact. All remaining verification done via unauthenticated reads only.
- 2026-11-08T12:3xZ — STEP 4 materials done: docs/blog.md (user-first, placeholders), docs/
  submission.md (Stage B addendum, repoUrl update, plain AI-assistance disclosure — code and video
  produced primarily with AI coding agents; check the form rule before ticking rules), docs/x-posts.md
  (2 drafts), docs/video-facts.json (generated by script from snapshot; regenerate at freeze).
- 2026-11-08T12:3xZ — FINAL verification pass (unauthenticated): all 6 static/api routes 200;
  /api/live-verdict source:"live", checkpoint 343023136 (advanced), digest==cpDigest (deployed build
  predates the fix — known), budget cap 25, counter live. Reports written: reports/stageB.md
  (CONDITIONAL GO). No further deploys attempted (MCP catalog instability; trial aborted).

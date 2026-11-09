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
- 2026-11-09T07:19Z — MCP TOOL OUTAGE DIAGNOSED + REPAIRED. Config intact; both remote endpoints
  answered (OPTIONS 204 / GET 401). /api/mcp for /home/unify/total-recall showed both servers
  "failed" (github: request timed out; vercel: getaddrinfo EAI_AGAIN) while /home/unify showed both
  "connected" — cached per-directory failure state after harness restarts. Repair:
  POST /api/experimental/mcp/{vercel,github}/connect with location[directory]=/home/unify/total-recall.
  Result: both connected (vercel tools=246, github tools=33), Code Mode catalog restored in-session.
- 2026-11-09T07:21Z — ROOT CAUSE CORRECTION for the 2026-11-08 404 deploy: NOT platform
  nondeterminism. Deployment file trees differ: working dpl_gGdg = src/index.html (root); broken
  dpl_5Ms = src/site/index.html (nested). The second manifest used site/<file> destination paths.
  No route existed at /.
- 2026-11-09T07:21Z — final export frozen for deploy (export embeds its timestamp, so byte-identity
  is per-artifact): index ddf1a7e1…, mcp 2b3d5c51…, evidence 077b25e9…, docs 926a9bb7…,
  og 9559ce00…, export.json 8f3318cf…; api/live-verdict b182d55c… (8711 B), api/recorded-evidence
  e16b7df0… (2191 B).
- 2026-11-09T07:22Z — uploaded 8 files (digest-verified), created dpl_kSA936fCcVbjktCZPBZtuUkU6Bud
  with EXPLICIT ROOT PATHS; state READY in ~4 s; file tree confirmed src/index.html (root).
- 2026-11-09T07:22Z — verified unique URL first: 6/6 routes 200 with matching SHA1s; /api/live-verdict
  source:"live", cp 343282448, digest != checkpointDigest (fix live).
- 2026-11-09T07:23Z — aliases assigned to dpl_kSA936…: recallguard-oxunify.vercel.app,
  freshness-bound-recall-oxunify.vercel.app, freshness-bound-recall.vercel.app. Production verify:
  3 hostnames × 6 files = 18/18 HTTP 200, byte-identical; API cp 343282668, verdicts STALE/withheld
  at read time, cap 25, counter live.
- 2026-11-09T07:24Z — reports corrected (reports/stageB.md now GO; CLAIMS C11/C20 updated). No
  Walrus writes, no signing, no publishes, no other Vercel/GitHub changes.

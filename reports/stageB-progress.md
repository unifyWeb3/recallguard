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
- 2026-11-09T07:27Z — cache claim checked at the edge: client sees `cache-control: public,
  max-age=0, must-revalidate` (Vercel strips s-maxage for browsers) but the CDN honors it:
  consecutive requests returned x-vercel-cache STALE then HIT with age 3; budget counter advanced
  only on revalidation. Documented in docs/mcp.md "Hosted live-verdict panel" and CLAIMS C20.
- 2026-11-09T08:0xZ — SITE REDESIGN shipped: warm paper/ink/one-rust editorial system, serif
  display, mono metadata, hairline rules, flat surfaces; all four pages re-rendered; OG card
  regenerated in the light palette. Homepage gained "Use it" (hosted check / MCP / CLI+API) and an
  in-page "Why no wallet" note. No Connect Wallet control exists by design: the gate never signs,
  custodies, or moves funds. Em-dash sweep completed across renderers and exported HTML (0 in all
  four pages); tests gained no-em-dash and no-wallet guards.
- 2026-11-09T08:21Z — source commit f76eff5 pushed. Exported site frozen (index 5e084510…,
  mcp 30daff5d…, evidence d31e471d…, docs 81355240…, og caa84d88…, export.json 513a5365…).
  Uploaded 8 digest-verified files; created dpl_DFM1wA8TvARAPnsmNyFFyzBJ4vVJ with root paths;
  READY; unique URL 6/6 byte-identical; aliases moved; production 18/18; API source:"live",
  cp 343297393, digest != checkpointDigest, cap 25.
- 2026-11-09T08:28Z — post-screenshot responsive fixes: mobile `.lv-card-head` stacks title and
  verdict pill; long `.command-card pre code` wraps at 390 px. Tests 162/162 pass; export
  refrozen: index cf1baa88… (40,116 B), mcp 65aa52f1… (35,662 B), evidence e54e0d37… (73,096 B),
  docs 87cd02c6… (35,965 B), og caa84d88… unchanged, export.json 09932725…; API hashes unchanged
  (live-verdict b182d55c…, recorded-evidence e16b7df0…).
- 2026-11-09T08:30Z — uploaded 6 static files (digest-verified) and created
  dpl_ExSsV7JGksQxacFRHf7uuEiMW5Z5 (target production, READY, tree has root index.html and api/).
- 2026-11-09T08:31Z — unique URL verified: 6/6 files HTTP 200 and SHA1-identical; `/` serves
  index.html; API source:"live", cp 343299219, both STALE/withheld, digest != cpDigest, cap 25.
- 2026-11-09T08:32Z — aliases reassigned to dpl_ExSsV7…: recallguard-oxunify,
  freshness-bound-recall-oxunify, freshness-bound-recall. Production verify 3 × 6 = 18/18 HTTP 200,
  byte-identical; canonical root matches; 0 em dashes served; API cp 343299450, budget live.
- 2026-11-09T08:33Z — cache-busted 390 px screenshot re-checked: both verdict pills stack
  consistently, terminal commands wrap without clipping. Responsive fix committed and pushed as
  2cff15dca1c4f021c83ae48772b5647353576fbd. Stage B report updated with the new deployment,
  hashes, 162 tests, redesign and no-wallet rationale.
- 2026-11-09T08:40Z — docs consistency sweep: README, CLAIMS, submission draft, blog, MCP
  reference, video script, judge guide, X drafts and the video-facts generator now use colons,
  semicolons, commas, parentheses or "n/a" instead of em dashes. README and judge docs state the
  current suite (162 tests). Removed a duplicated line in docs/submission.md. Tests 162/162 pass.
  Source-only change: the deployed site bytes are unchanged.
- 2026-11-09T08:44Z — freeze artifact regenerated: `GIT_COMMIT=7127cbf node
  scripts/generate-video-facts.mjs` wrote docs/video-facts.json with commit 7127cbf, 22 memories,
  306 decisions, 162 tests, track "02: Smart Agents for Real Life", and zero em dashes. Committed
  as f620417. Production site remains on dpl_ExSsV7JGksQxacFRHf7uuEiMW5Z5 with the 08:29Z export.
- 2026-11-09T10:24Z — Small copy and evidence change before freeze. Homepage example replaced with the controlled SUI balance test: TREASURY remembered 0.300 SUI, a 0.05 SUI transfer with digest ByVLF39Tbr9A1JFdo7tCjseM2ZDq2ouTKfK9SzK7PQX6, old answer WITHHELD, superseding memory recorded. Recorded FRESH cases are now shown beside the live panel, including PAYEE after 3895 idle checkpoints. Wording now says: idle control: false-stale observed live; no policy change written (below the sampling floor). Gas is shown from balance delta: transaction 1 spent 51,088,000 MIST, of which 50,000,000 MIST was the transfer and 1,088,000 MIST was gas; the 2,076,000 MIST simulation value is labelled as an estimate. Existing limits kept: no users, no traction, one Tatum product used, live panel is best effort. Source commit fed618a1abe72545f9b726247e7d59917439adf2. Tests 168/168 pass. Export hashes: index baeb9a4d… (41,588 B), mcp 65aa52f1… (35,662 B), evidence 19e33668… (81,469 B), docs cb83fe86… (36,093 B), og caa84d88… (7,668 B), export.json 5791ab1f… (824 B); API hashes unchanged. Secrets audit PASS, history audit PASS, exported pages contain zero em dashes. Deployment dpl_7hrEaJAc2JUyYuCSaTGDMpuWkchh READY and verified on its unique URL. Aliases reassigned to dpl_7hrEaJAc2JUyYuCSaTGDMpuWkchh. Production verify 3 hostnames x 6 files = 18/18 HTTP 200 and hash identical.

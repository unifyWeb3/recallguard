# Stage B report — RecallGuard — 2026-11-09 (supersedes the 2026-11-08 draft)

**GO/NO-GO: GO.** The digest fix is deployed and verified in production. All three production
hostnames serve the Stage B pages byte-identically to the frozen export, and
`/api/live-verdict` returns `source:"live"` with the checkpoint digest distinct from the object
digest. The earlier 404 deployment was **not** platform nondeterminism: its manifest placed the
static files under `site/` in the deployment tree. That is corrected and verified below.

## URLs

| Item | URL |
|---|---|
| Production site (canonical) | <https://recallguard-oxunify.vercel.app> |
| Also serves (same bytes) | `https://freshness-bound-recall-oxunify.vercel.app`, `https://freshness-bound-recall.vercel.app` |
| Live verdict API | <https://recallguard-oxunify.vercel.app/api/live-verdict> |
| Repository | <https://github.com/unifyWeb3/recallguard> (renamed 2026-11-08; old URL redirects) |
| Deployment in production | `dpl_ExSsV7JGksQxacFRHf7uuEiMW5Z5` (READY, target production) |
| Superseded deployments (unaliased) | `dpl_DFM1wA8TvARAPnsmNyFFyzBJ4vVJ` (previous, pre-mobile-fix), `dpl_kSA936fCcVbjktCZPBZtuUkU6Bud` (digest fix, pre-redesign), `dpl_gGdgqmEdXvawCzTMgNBmjkdoiKVZ` (old working), `dpl_5Ms53Yo9bX5FcQSNoD7daRkAQZsE` (broken 404 — do not promote) |

## Code and content in production

- Site source commit: `2cff15dca1c4f021c83ae48772b5647353576fbd` (`2cff15d`); the editorial
  redesign landed in `f76eff5`, and `2cff15d` carries the final 390 px responsive fix. The
  deployed static bytes were exported from that exact working tree and are reproducible from
  `2cff15d`. Deployment metadata records `f76eff5` with `dirty:true` because the deployment was
  created before the fix was committed; the shipped bytes match `2cff15d`.
- Deployed `api/live-verdict.mjs` SHA1 `b182d55c28b7cd8394cebcb12e0a77107eab5730` — includes
  `cpDigest` captured from the checkpoint query (unchanged since the digest fix).
- Static pages exported at `2026-11-09T08:29Z` (the export embeds its timestamp by design, so
  byte-identity is verified against this frozen artifact, not across export runs).
- The site was rebuilt on a warm paper (`#f4f0e6`) / ink (`#17150f`) / one rust accent (`#a83a1e`)
  system: serif display, mono metadata, hairline rules, flat surfaces, no gradients, no shadows.
  The homepage gained an explicit "Use it" section and an in-page `#no-wallet` explanation. There
  is no Connect Wallet control anywhere: the product never signs, custodies, or moves funds, so a
  wallet button would be theater. The hosted check, MCP server, and CLI all work without one.
- The 22 recorded Mainnet memories are presented as evidence that each record exists (blob id plus
  checkpoint stamp), not as proof that a claim is still true. The modelled 214/16/4 split remains
  labelled and confined to the evidence page.

## What was verified (unauthenticated, 2026-11-09 ~08:32Z)

- **3 hostnames × 6 static files = 18/18 HTTP 200**, all byte-identical to the frozen export:
  - `index.html` `cf1baa8863862a5776b6558772fa15d8ff3fd29f` · 40,116 B
  - `mcp.html` `65aa52f1018f208187a6770fdefdd5601e2a512c` · 35,662 B
  - `evidence.html` `e54e0d37e4cb3e796b48e18be4dc4fe0d86e9788` · 73,096 B
  - `docs.html` `87cd02c6598dee275a4e8707037384c8f2a2b463` · 35,965 B
  - `og.png` `caa84d88e7b33bc4a6fd6a201bd2ffd92a0ebddc` · 7,668 B
  - `export.json` `0993272546d80675ba99cd2ded10137cc6db5265` · 824 B
- **`GET /api/live-verdict`** → 200, `source:"live"`, checkpoint `343299450` and advancing
  (`343296745 → 343297393 → 343299219 → 343299450` across verification calls), both subjects
  present, verdicts `STALE`/withheld computed at read time (recorded versions predate current
  state), `budget.daily_cap = 25`, counter incrementing.
- **Digest fix verified live:** `subjects.fast.live.digest != subjects.fast.live.checkpointDigest`
  for both subjects. Checkpoint digest comes from `checkpoints(last:1)`, object digest from
  `object(address:)`.
- **Deployment file tree** (`list_deployment_files`): `src/index.html`, `src/mcp.html`,
  `src/evidence.html`, `src/docs.html`, `src/og.png`, `src/export.json`,
  `src/api/live-verdict.mjs`, `src/api/recorded-evidence.mjs` — static files at the root, API
  under `api/`.
- **Aliases:** `recallguard-oxunify.vercel.app`, `freshness-bound-recall-oxunify.vercel.app`,
  `freshness-bound-recall.vercel.app` — all three reassigned to `dpl_ExSsV7…` and verified.
- **Root path** `/` serves `index.html` byte-identically (HTTP 200, same SHA1).
- **Em dashes:** 0 in all four exported pages and in the served homepage. Site tests enforce the
  guard.
- Tests: **162/162 pass**. Secrets scan on export: none. Export has no missing in-page anchors,
  no duplicate ids, no font below 11 px, no gradients/shadows, `prefers-reduced-motion` and
  `:focus-visible` present.
- Mobile visual check at 390 px (public screenshot service, cache-busted): verdict pills stack
  consistently under both live-panel titles, and long terminal commands wrap instead of clipping.

## Root cause of the earlier 404 (correcting the 2026-11-08 record)

The 2026-11-08 draft called the 404 deploy "platform nondeterminism." That was wrong. Comparing
deployment file trees showed:

- working `dpl_gGdg`: `src/index.html`, `src/mcp.html`, … (root)
- broken `dpl_5Ms`: `src/site/index.html`, `src/site/mcp.html`, … (nested under `site/`)

The second upload manifest used `site/<file>` as the destination path, so no route existed at `/`.
The 2026-11-09 deployment used explicit root paths (`index.html`, `mcp.html`, …, `api/*.mjs`) and
served all routes correctly on the unique deployment URL **before** aliases were assigned.

## MCP tool outage and repair (2026-11-08 → 2026-11-09)

Symptom: the Code Mode catalog exposed no `vercel.*` or `github.*` tools; `search(namespace:"vercel")`
returned zero items; `tools.opencode.list_mcp_resources()` was empty.

Findings:

- Config was intact (`mcp.servers` with remote GitHub + Vercel entries); both remote endpoints
  answered unauthenticated probes (`OPTIONS` 204 / `GET` 401 for `mcp.vercel.com`).
- `/api/mcp?location[directory]=/home/unify/total-recall` reported both servers **failed**
  (`Request timed out`, `getaddrinfo EAI_AGAIN mcp.vercel.com`) while the same call for
  `/home/unify` reported both **connected** — a cached per-directory failure state after the
  harness restarts, not a credential or network failure.
- Repair: `POST /api/experimental/mcp/{server}/connect?location[directory]=/home/unify/total-recall`
  for `vercel` and `github`; both returned to `connected` (log: `mcp connected server=vercel
  tools=246`, `server=github tools=33`) and the tool catalog refreshed in-session.

Operational note: if the catalog empties again after a restart, re-run those two connect calls — do
not edit credentials or re-authenticate.

## What ONLY you can check on a phone

1. <https://recallguard-oxunify.vercel.app> — hero legibility, both live-verdict cards, no
   horizontal overflow at 390 px, verdict shown as ✕/✓ plus text (not colour alone), badge reads
   `LIVE · Tatum` after the fetch.
2. The "Use it" section and the "Why no wallet" note: confirm the three entry points read clearly
   and that the absence of a wallet button makes sense.
3. The hypothetical treasury example card reads as hypothetical, not as a recorded incident.
4. Blob links open the Walrus aggregator read path (raw JSON is expected).
5. `/og.png` renders in a link-preview context.
6. `/mcp.html` install lines are copy-pasteable on a phone screen.

## Decisions for you

1. **Delete the four superseded deployments?** `dpl_DFM1…` (pre-mobile-fix), `dpl_kSA936…`
   (pre-redesign), `dpl_gGdg…`, and the broken `dpl_5Ms53…` are unaliased and harmless. I left
   them as rollback artifacts; deletion is a Vercel change outside this authorization.
2. **Publish path and timing** — blog after your review, then you record the video, then you submit
   the form. Freeze is 2026-11-09 14:00 UTC; deadline 2026-11-10 17:00 UTC.
3. **`docs/video-facts.json`** must be regenerated at the freeze
   (`node scripts/generate-video-facts.mjs`) so its commit hash matches the frozen tree.

## Not done (by design, authorization)

No Walrus writes, no Mainnet spend, no signing, no social posts, no form submission, no publishes.
Env vars (`TATUM_API_KEY` sensitive, `LIVE_CHECK=on`, `TATUM_SMOKE_DAILY_CAP=25`) are
production-only; the key was never printed. No other Vercel or GitHub settings were changed.

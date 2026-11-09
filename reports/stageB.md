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
| Deployment in production | `dpl_kSA936fCcVbjktCZPBZtuUkU6Bud` (READY, target production) |
| Superseded deployments (unaliased) | `dpl_gGdgqmEdXvawCzTMgNBmjkdoiKVZ` (old working), `dpl_5Ms53Yo9bX5FcQSNoD7daRkAQZsE` (broken 404 — do not promote) |

## Code and content in production

- Repository commit: `71cbc4fec15ddc4be6698815cbbd206e75ab4a58` (digest fix; same source as the
  deployed function).
- Deployed `api/live-verdict.mjs` SHA1 `b182d55c28b7cd8394cebcb12e0a77107eab5730` — includes
  `cpDigest` captured from the checkpoint query.
- Static pages exported at `2026-11-09T07:21Z` (the export embeds its timestamp by design, so
  byte-identity is verified against this frozen artifact, not across export runs).

## What was verified (unauthenticated, 2026-11-09 ~07:23Z)

- **3 hostnames × 6 static files = 18/18 HTTP 200**, all byte-identical to the frozen export:
  - `index.html` `ddf1a7e1cd413610bc21f149d24937a0debf724d` · 31,254 B
  - `mcp.html` `2b3d5c51e4b39491c06f220247722501b26eaa18` · 27,988 B
  - `evidence.html` `077b25e96f6fe4e20c888a0770bfbb83a5a4d9eb` · 65,449 B
  - `docs.html` `926a9bb7779c970ee98bcc4a9d5986e573a9b071` · 28,287 B
  - `og.png` `9559ce00a75aa917f4ba9680622013eafea8336f` · 7,667 B
  - `export.json` `8f3318cf4e16675dcac4a4e45ac87b0b81e72a38` · 824 B
- **`GET /api/live-verdict`** → 200, `source:"live"`, checkpoint `343282668` and advancing
  (`343282448 → 343282668`), both subjects present, verdicts `STALE`/withheld computed at read
  time (recorded versions predate current state), `budget.daily_cap = 25`, counter incrementing.
- **Digest fix verified live:** `subjects.fast.live.digest != subjects.fast.live.checkpointDigest`
  (previously equal). Checkpoint digest comes from `checkpoints(last:1)`, object digest from
  `object(address:)`.
- **Deployment file tree** (`list_deployment_files`): `src/index.html`, `src/mcp.html`,
  `src/evidence.html`, `src/docs.html`, `src/og.png`, `src/export.json`,
  `src/api/live-verdict.mjs`, `src/api/recorded-evidence.mjs` — static files at the root, API
  under `api/`.
- **Aliases** (`list_deployment_aliases`): `recallguard-oxunify.vercel.app`,
  `freshness-bound-recall-oxunify.vercel.app`, `freshness-bound-recall.vercel.app` — all three on
  `dpl_kSA936…`.
- Tests: **160/160 pass**. Secrets scan on export: none. History audit: PASS.

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
2. The hypothetical treasury example card reads as hypothetical, not as a recorded incident.
3. Blob links open the Walrus aggregator read path (raw JSON is expected).
4. `/og.png` renders in a link-preview context.
5. `/mcp.html` install lines are copy-pasteable on a phone screen.

## Decisions for you

1. **Delete the two superseded deployments?** `dpl_5Ms53…` (broken) and the old `dpl_gGdg…` are
   unaliased and harmless. I left them as rollback artifacts; deletion is a Vercel change outside
   this authorization.
2. **Publish path and timing** — blog after your review, then you record the video, then you submit
   the form. Freeze is 2026-11-09 14:00 UTC; deadline 2026-11-10 17:00 UTC.
3. **`docs/video-facts.json`** must be regenerated at the freeze
   (`node scripts/generate-video-facts.mjs`) so its commit hash matches the frozen tree.

## Not done (by design, authorization)

No Walrus writes, no Mainnet spend, no signing, no social posts, no form submission, no publishes.
Env vars (`TATUM_API_KEY` sensitive, `LIVE_CHECK=on`, `TATUM_SMOKE_DAILY_CAP=25`) are
production-only; the key was never printed. No other Vercel or GitHub settings were changed.

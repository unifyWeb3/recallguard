# Stage B report — RecallGuard — 2026-11-08

**GO/NO-GO: CONDITIONAL GO.** The Stage B product work is done and pushed (`06dc83f..7033763`),
and production serves the Stage B pages + live-verdict API correctly today (verified
unauthenticated, hashes match). Two defects stand between you and a clean submission: (1) the
deployed live-verdict response labels the checkpoint digest with the object digest (fix committed,
not deployed); (2) a mid-flight Vercel deploy produced a broken deployment (static 404, λ only),
which was rolled back within minutes. **No deploy happened after the fix because the tool surface
restarted three times and a trial redeploy was aborted by the environment.** A single build pickup
from the Vercel dashboard (or one redeploy) clears both.

## URLs

| Item | URL |
|---|---|
| Production site (current, working) | <https://recallguard-oxunify.vercel.app> |
| Also serves (unchanged) | `https://freshness-bound-recall-oxunify.vercel.app`, `https://freshness-bound-recall.vercel.app` |
| Live verdict API | <https://recallguard-oxunify.vercel.app/api/live-verdict> |
| Repository | <https://github.com/unifyWeb3/recallguard> (renamed 2026-11-08; old URL redirects) |
| Deployment in production | `dpl_gGdgqmEdXvawCzTMgNBmjkdoiKVZ` |
| Broken deployment (unaliased, do not promote) | `dpl_5Ms53Yo9bX5FcQSNoD7daRkAQZsE` |

## Commit hash in production: `a9b0d32e2202c54a877a063152bc3ccece973ebd` (Stage B materials commit) with `7033763` for the digest fix (not in production).

## What was verified (unauthenticated)

- **All five static files + API: HTTP 200**, sha256 of served bytes == local `npm run export` output
  (`index e6ada2…` → now `ddf1a7e1cd413…` index, `2b3d5c51…` mcp, `f86251e5…` evidence, `926a9bb7…`
  docs, `9559ce00…` og.png, `443bb251…` export.json).
- `GET /api/live-verdict` → 200, `source:"live"`, both subjects present, verdicts STALE/withheld via
  read-time pin comparison (checkpoint advancing: 342981833 → 342982882 → 343023136 across probes),
  `budget.used` increments (1), daily cap 25.
- **Repo rename**: clone/ls-remote of `unifyWeb3/recallguard` OK at `7033763`; old name resolves
  (git layer 200); GitHub web frontend was intermittently unreachable 503/502 from this host all
  day — the rename itself is VERIFIED via `gh repo view` (name=recallguard, branch main).
- Tests: **160/160 pass** at `7033763`. Secrets audit PASS (fresh clone: PASS with
  fresh-clone-mode note; owner tree 11/11). History audit: 0 findings.
- MCP smoke (stdio): 9/9 PASS. MCP protocol tests: 16/16.
- Client configs: Claude Code 2.1.318 ✔ Connected, codex-cli 0.167.0 server `enabled` (isolated
  HOMEs; your real client config untouched).

## Deployed-but-unfixed in this release

`checkpointDigest` in the live response equals the object digest (variable shadowing; verdicts and
object digests are unaffected). Fix + assertion committed at `7033763`; it needs one build pickup.

## What ONLY you can check on a phone

1. Open <https://recallguard-oxunify.vercel.app> on your phone: hero legibility, the live panel
   renders both cards, no horizontal overflow at 390 px, WITHHELD cards show ✕ + text, links work,
   the example card reads cleanly, the aggregator blob links open (raw JSON is expected).
2. Tap through to `/mcp.html` and run the page's install lines in a fresh terminal if you have one.
3. Decide the 404-looking behavior risk: the panel silently falls back to `REPLAY · snapshot` when
   live fails — good; but confirm the badge copy reads correctly on a phone screen.
4. The site is a **labelled static snapshot** — it fires no network requests except your click.
5. `https://recallguard-oxunify.vercel.app/og.png` on your phone (if a link preview renderer shows it).

## The 2026-11-08 deployment nondeterminism (full context)

Deploy #2 (`dpl_gGdg`) served all 8 files perfectly. Deploy #3 (`dpl_5Ms`, same bytes byte-for-byte,
`skipAutoDetectionConfirmation=1`) built fine but attached **no static routes** (page 404, λs fine).
Build logs were identical. Rolled all three aliases back to `dpl_gGdg` within minutes. A trial
redeploy was aborted by environment restarts. Until the next deploy is verified end-to-end, do not
promote `dpl_5Ms`-class artifacts; if you redeploy from the dashboard (recommended, it clears the
digest fix deterministically: project → Deployments → Redeploy), then hash-verify the four pages
and `/api/live-verdict` afterward — if pages 404, roll aliases back to `dpl_gGdg`.

## Decisions you must make

1. **One more deploy?** Yes/no/which path: (a) you click Redeploy from Vercel dashboard (fastest,
   deterministic), or (b) authorize me to retry the files-upload deploy when the tool surface is
   stable. Either clears the digest fix.
2. **Keep `dpl_5Ms` (broken) and the aborted trial deployment?** They are unaliased and harmless;
   leave as rollback artifacts or delete — your call; I left them untouched.
3. **Video/submission timeline** — blog first, then video record Tue (your hands), then form.
   Freeze is 2026-11-09 14:00 UTC; deadline 2026-11-10 17:00 UTC. I stopped all building per your
   freeze constraint.

## Not done (by design, authorization)

No Walrus writes, no Mainnet spend, no social posts, no form submission, no publishes. Env vars
(`TATUM_API_KEY`, `LIVE_CHECK=on`, `TATUM_SMOKE_DAILY_CAP=25`) are production-only and were set via
the authorized path with the key never printed.

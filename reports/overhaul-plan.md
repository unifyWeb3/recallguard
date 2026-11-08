# Overhaul plan — RecallGuard — 2026-11-08

Scope: the hours between now and the 2026-11-10 00:00 UTC build freeze, then freeze → deadline.
Reads `reports/overhaul-research.md` first. Impact order is deliberate: presentation is the
largest losing axis, then live-proof credibility, then polish — integration depth is already our
best side.

Time check 10:12 UTC, Sun 2026-11-08. Deadline **Tue 2026-11-10 17:00 UTC** (54 h). Freeze
**2026-11-10 00:00 UTC** (T−17 h). Materials after freeze. 6 h buffer lands 11:00 UTC. Reality:
building budget ≈ **8 h** (two ~4 h blocks over Nov 8–9); the rest is video, blog, posts,
submission — and sleep.

## Ship-by-freeze list (impact order)

1. **Hero rewrite — named user + job on the first screen** (IA + copy below). [0.5 h]
2. **Homepage “live verdict” panel** (R7 Option B): pick a memory → live Tatum read → verdict
   (or snapshot fallback with `REPLAY` badge). Replaces the buried "try it" slot on the home page.
   Server function + client island; bundled snapshot fallback. [3 h]
3. **Proof-above-claims strip** on the homepage: the `STALE → FRESH → STALE` lifecycle mini-table
   with real blob IDs and the modeled-counterfactual line (214/16/4, labelled), linking to
   `/evidence.html`. [1 h]
4. **Naming/UX consistency pass**: unify `recallguard`/`recall_checked` help text; Dockerfile tag;
   CLI help; add OG image (SVG → PNG ok) + `og:image` tags + `meta twitter`; add `CLAIMS.md`
   (claims ledger pointed at the real blobs/reports). [1.5 h]
5. **Mobile & a11y polish**: fix 9 px mono cells (min 11 px), wrap capture grids, verify 390 px. [0.5 h]
6. **README opening**: swap mechanism-first for user-first; keep every honesty label intact. [0.5 h]

**Total ≈ 7 h.** Anything above rides or dies on the freeze — no exceptions.

## CUT list (explicit, for this cycle)

- Tatum blockchain-mcp integration (SKIP; see research R4).
- Any new MCP tools/transports/remote servers; any paid Tatum plan changes.
- Walrus writes of any kind (no new memories; reuse the 22).
- Repo rename, package rename, Vercel project rename, DNS/alias changes.
- /status, /proof dashboard analytics, health endpoints, dashboards.
- New tracks/awards (Agent Payments unreachable); Mystery Bounty speculation.
- Pixel-perfect full redesign; design-token framework; component library.
- More memories, new subjects, more corrections.
- Dockerfile verification (stays labelled UNVERIFIED).

## Homepage — information architecture (top → bottom)

`Shell (logo · nav: Overview / MCP / Evidence / Docs / GitHub)` →
**Hero** → **Live verdict panel** → **How it works (4 steps)** → **Learning loop (recorded TikTok-style
verdict flip)** → **Comparison table** → **MCP/CLI/API cards** → **Evidence CTA (22/306 labelled)** → footer.

### Exact first-screen copy

> eyebrow: AI-agent memory · verification layer
> H1: **Your agent remembers. RecallGuard checks whether it's still true.**
> sub: A treasury or ops agent on Sui recalls what it believed — an allowance, a registry pin, a
> “safe to pay” flag. RecallGuard checks that memory against live chain state through Tatum before
> the agent acts. If the world moved, the answer is withheld and the verified value is used instead.
> primary: **See a withheld answer live** → #live-verdict   secondary: Add it to your agent via MCP
> micro-line: Read-only by default · no wallet required · fail-closed · no LLM in the answer path
> right card: RECORDED MAINNET DECISION — recalled `cor-sui-clock-341742463` (v1018797298, cp
> 341742463) → live pin v1019267077 (cp 341868687) → **WITHHELD** — with a link to /evidence.html.

Three reasons this beats today's hero: (i) it names the user ("treasury/ops agent"), (ii) it names
the pain before the mechanism, (iii) the visual is a real WITHHELD card, not a feature grid.

## UI spec (freeze-safe)

- Type scale: 12 / 13 / 14 / 16 / 20 / 28 / 40 / 54 (mono for data; 14/16 for prose; measure ≤ 72ch).
- Spacing: 4 px base; section rhythm 64/48 px desktop, 48/32 mobile; shell ≤ 1200 px.
- Color: bg `#151310`; raised `#1c1a17`; ink `#ece8de`; secondary `#aaa49a`; hairline rgba(236,232,222,.10);
  **one accent** amber `#e5a83d` (verdicts, CTA, focus ring) — same accent, no new hues; semantic verdicts
  stay ink-vs-amber (never green/red).
- **No gradients, glows, glass, neon, purple.** Flat surfaces; 12 px radius; 1 px hairline borders.
- Typography: system sans; mono UI-monospace for ids/verdicts; H1 44–54 px / 1.06 line-height; sentence case.
- Motion: ≤ 200 ms transitions on color/border only; stepper may cross-fade; `prefers-reduced-motion` honored.
- A11y: skip link first; `:focus-visible` 2 px amber; contrast ≥ 4.5; scroll regions `tabindex=0`;
  tables labelled; no hover-only content.
- All four pages keep ≤ 1 accent; evidence stays dense but gains a 4-row TL;DR anchor strip at top.

## Live check — spec (R7 Option B)

`GET /api/live-verdict?subject=fast|slow` → fixed server-side queries (no client input beyond the
enum): `checkpoint{sequenceNumber}` + `object(address){version digest}` with **1 s cache**. Env:
`TATUM_SMOKE_DAILY_CAP` (default 25/day/deployment, module-scope counter + `x-ratelimit-remaining`),
`LIVE_CHECK=off|on` kill switch. Per-IP bucket (10/min). Response ≤ 2 KB; headers
`s-maxage=2, stale-while-revalidate=60`; **any** failure (timeout 3 s, 4xx/5xx, schema drift, budget
cap) → 200 with `source:"snapshot"` payload identical in shape. Badge shows `LIVE · Tatum` vs
`REPLAY · offline snapshot` from the body, never from client guess. Measured: log only call count,
never the key; capture counter deltas to finish `credits/call = UNKNOWN` (see research R7).

## Naming decision — options (recommendation first)

- **Option 1 (recommended): keep `RecallGuard` + repo `unifyWeb3/freshness-bound-recall` + alias.**
  One sentence in README/docs: organised development under the new product name. Zero cost; judges
  care about function, not repo slug; changing breaks git history links, the Vercel alias, every
  submitted artifact, and 2 docs.
- **Option 2: rename repo to `recallguard` + keep Vercel alias.** GitHub preserves history; alias
  stays valid; cost ≈ 0.5 h + broken-import risk in README links if URLs absolute (we use absolute);
  still leaves hosted URL inconsistent (`freshness-bound-recall-oxunify.vercel.app`).
- **Option 3: full rename (repo + Vercel alias + new domain?).** Alias changes are free but the
  submission-form `repoUrl` would change identity late; any judge who cached the old repo URL hits a
  redirect (GitHub redirects repo renames, so it works) — still: **high churn, zero benefit**; reject.
- **Option 4 (hygiene only):** unify all lowercase invocations to `recallguard` (bins/help/Docker
  tag), leave repo and alias. If you want a `docker build -t recallguard`, fine.
- Decide after the submission is drafted; do not rename before 2026-11-10 under any option.
- Note: `recallguard` name **already used for package + bin** is consistent; the mismatch class is
  visual (alias + repo), not functional.

## Acceptance tests (freeze gate)

- `npm test` ≥ 149/149 at HEAD (no regressions); new function tests: budget cap trips →
  snapshot response with `source:"snapshot"`; kill switch `LIVE_CHECK=off` → snapshot; timeout →
  snapshot; per-IP bucket → 429 + snapshot.
- `npm run export` → 4 pages; scanner: no `.env` value, no secret-shaped string, no local paths.
- Hosted `GET /` shows LIVE badge on success, REPLAY on forced-fail (env), both render fully;
  network tab shows ≤ 2 Tatum/API requests per click; fallback identical shape.
- axe-core ruleset scan of the 4 static pages (no install: manual checklist) — 0 violations on
  skip-link, labels, focus, contrast; 390 px pass: no horizontal overflow (compare scrollWidth).
- First-screen copy audit: a stranger (not you) names the user, the product, and the action in
  ≤ 5 s (test with 2 humans; record their answers).
- Git: one commit per milestone; no history rewrite; push; deploy alias verified unauthenticated.

## Risk register

| Risk | L×I | Mitigation / owner |
|---|---|---|
| Live check fails publicly (429/quota/schema drift) | M×H | Kill switch + snapshot fallback identical shape; cap 25 calls/day; test with `LIVE_CHECK=off` first (this task) |
| Demo looks broken to judges > integration gold | M×H | Fallback badge REPLAY is proudly labelled (never silent); test both modes pre-record |
| Time theft by "more polish" | H×M | Freeze, CUT list, timer discipline; owner holds scope |
| Rename impulse → broken links | M×M | Option 1 rule; freeze changes to name |
| Video pressure vs build temptation | M×M | Record on Nov 9 after fallback is proven; blog auto-derives from script + report |
| Export/page nondeterminism (evidence ages) | L×L | Re-export at deploy time; deploy verification readback per 2026-11-07 report |
| Credit burn from live panel | L×M | 25/day cap + counter; owner measures credits once dashboard open |
| Judge can't open the MCP path | M×M | Quickstart measured 9/9; keep one-liner in all surfaces |
| Slice "who is this for?" goes vague in final copy | M×M | Exact copy above is contractual for the freeze build |

## Video / blog / submission schedule (freeze → deadline)

- **Mon 2026-11-09 (build day, early freeze at 00:00 UTC Tue):** morning — live panel + fallback
  proof (LIVE_CHECK=off first, then on with 2 manual calls); midday — hero/IA land + OG image;
  afternoon — 390 px pass + full export + `npm test` + deploy to production alias; verify unauth
  readback (hash check). Export final snapshot.
- **Tue 2026-11-10 00:00–06:00 UTC (buffer opens, no new code):** write blog from script
  (`docs/blog.md` already carries numbers; swap Opening → user-first; add live-verdict URL);
  publish blog on the channel you own (X/LinkedIn/Medium/dev.to — **your voice**; never post as
  someone else); record 3:00 video per updated shot list (demo + MCP smoke + live-verdict button);
  edit/upload (venue you control); re-check submission draft (`docs/submission.md`) — fill demo
  URL + final numbers; **blog live before submission**.
- **Tue 2026-11-10 06:00–11:00 UTC: 6 h buffer** — fix upload/encoding issues; secondary channel
  posts per bonus rules (honest content, tag @Tatum_io @WalrusFoundation if you want); dry-run
  **your own** read-through of the form; keep freeze clean.
- **By 11:00 UTC:** everything submitted-side ready; you personally press submit at ~12:00 UTC,
  verify confirmation page, keep submission id; screenshot it.
- **17:00 UTC: deadline.** Judging Nov 11–16. Results Nov 17.

## GO / NO-GO

**GO — surgical overhaul only** (fresh-verdict panel, hero/user-first copy, proof-above-claims,
og:image, naming hygiene, publish materials). The product is good enough to win Presentation with
honest polish; it is not good enough to win if the judge never feels it.

**Single biggest risk:** the live check fails publicly during judging and the "live Tatum" claim
falls back silently — which would convert our one honest weakness into the perception of over-claim.
Mitigation is the kill-switch + identical-snapshot-shape fallback and pre-recorded video showing a
forced snapshot explicitly.

**3 decisions for you:**
1. **Live check A vs B** — B (recommended) uses Tatum credits (UNKNOWN); A is free but anonymous
   5 rpm and stale-root risk. Do you approve Option B + the 25 calls/day cap, and do you want to
   measure credits now (10 min) or leave UNKNOWN?
2. **Hero persona** — treasury/ops agent on Sui (recommended; matches our recorded objects) or
   wallet agent — approve one and I proceed without further debate.
3. **Naming** — confirm Option 1 (no rename; unify lowercase bins internally), or do you want the
   `recallguard` repo+alias rename done after submission as a post-hackathon hygiene task (never
   before Nov 10)?

Then STOP — no build executed; research and plan only, per this task's remit.

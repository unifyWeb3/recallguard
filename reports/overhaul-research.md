# Overhaul research — RecallGuard — 2026-11-08

**Verdict (five seconds):** the product's integration depth and technical quality stand; what loses
the hackathon is that a stranger cannot *feel* it in five seconds, there is no live proof on the
public page, and nothing public has shipped (no video, blog or posts). GO for a **surgical**
overhaul inside the build freeze — live-proof panel, named persona, first-screen rewrite, naming
consistency fix, published materials. NO-GO for new features, new transports, rebranding to a new
name, or repo renames before award. **Tatum MCP: SKIP. Live check: Option B (Vercel function
proxy).**

Labels: VERIFIED / INFERRED / HYPOTHESIS / UNKNOWN. Timebox: 2.5 h from 10:05 UTC. Now: 10:12 UTC;
deadline **Tue 2026-11-10 17:00 UTC** (≈ 54 h 48 m). Build freeze **2026-11-10 00:00 UTC** (T−17 h),
materials after freeze, 6 h buffer to 11:00 UTC.

## R1 — Competitors (all public; fetch log in Appendix A)

| Entry | Track | Demo (status) | First screen says | Walrus | Tatum | Tests/licence | Video/blog/posts |
|---|---|---|---|---|---|---|---|
| **CALBOK** (0xileri/CALBOK) | T1 + BWM | calbok.xyz — **200** | “Lock a crypto call before it happens. See who’s actually right.” | **High**: MemWal auto-write; **41 mainnet memories**; restart-recall proof; blob IDs published | OHLCV (only 5/44 settlements — lagged, backups used) + Sui gRPC GetCoinInfo | none published; no licence | YT + X post + repo blog |
| **AFTERMATH** (itzebe/aftermath) | **T2** | itzebe.github.io/aftermath/ — **200** | “Every failure should leave a safeguard.” | Med-High: safeguard records + public Walrus ledger | Sui-Tatum (verification tooling) | none; no licence | **captioned video + Medium blog** |
| **Countersign** (Makami27/countersign) | **T2** | countersign.nittings.xyz — **200** | “Your agent only pays signatures it has on file.” | **High**: 12 mainnet memories; restore-on-start; shared-memory | Tatum GraphQL+gRPC; 2 req/s; **testnet** money | **71 tests**; claims ledger; /status+/proof | none found |
| **RIMBA** (edycutjong/rimba) | T1 + BWM | rimba.edycu.dev — **200** | “Each large Sui transfer is a sighting. …” | **Low (honest)**: memory **stand-in** only; 0 counted rounds | **gRPC stream** (578 Tatum rows); verify re-derives 9/9 | CI + MIT; releases | none found |
| invoice-chaser · WalSniff · tideover · spend-aware-agent · sui-money · remora | T1/T2/T3 | all 200 (remora: no demo found) | one-liner stated | shallow/unknown (UNKNOWN) | unknown | see Appendix | blog/slides only on tideover |
| **enoch208** (Cairn, CLAY Hackathon 2026) | n/a — **no Total Recall entry** | (different event) | — | Médium (in-process index; restore unproven) | None-Tatum (testnet Move anchor) | MIT, 13 tests + CI, releases/tags none | Strong README discipline |
| **mrnetwork0001** (Inktoll/MemoriaDA/Meritor/Judr) | n/a — **no Total Recall entry** | — | — | — | — | 26 tests (MemoriaDA) etc. | Few; Inktoll 61★ |
| **0xileri/CALBOK** | (see CALBOK above) | | | | | | |

CALBOK sets the bar (live app, public counts, video, blog, posts); AFTERMATH & Countersign are
Track-2 rivals shipping what we lack (video/blog; `/status` + `/proof`; 71 tests). Identity
checks: mrnetwork0001 = Onwo Ifeanyichukwu ("MrNetwork"), **no Total Recall entry** (Meritor/ShieldSuite/SyntraceAI); Enoch208 — **no Total Recall entry** (Cairn = CLAY). UNIDs: partially UNRESOLVED.

### R1 scoring on the rubric (1–10; cited in Appendix A)

| Axis (weight) | CALBOK | AFTERMATH | Countersign | RIMBA | RecallGuard (us) |
|---|---|---|---|---|---|
| Walrus+Tatum (30%) | 8 — real mainnet writes visible, Tatum with backup/degraded mode | 6 — credible sui-use, less Tatum | 8 — most complete payments+memory, but testnet money | 6 — gRPC real, memory stand-in | **6.5** — real memories/corrections/policy on Mainnet via MCP+GraphQL; **live verification unverified**; no public count on site |
| Technical quality (30%) | 7 — runs, but ~zero visible tests, degraded Tatum path | 7 — solid, small | 8 — 71 tests, CI(?) + /status health | 8 — CI, verify tooling, Brier scoring | **8** — 149 tests, audits, fail-closed, MCP protocol tests |
| Creativity (20%) | 8 — clean public narrative, receipts framing | 7 — solid incident concept | 8 — provenance-first payee memory vs prompt-injection | 9 — naturalist framing; live reef | **8** — freshness gate is genuinely novel in this cohort |
| Presentation (20%) | 9 — video + blog + X + live app w/ public counts | 8 — Medium + captioned video + Pages | 7 — /proof /status pages, no video/blog | 8 — beautiful animated README/site, honest 0s | **4** — no published video/blog/post; OG image missing; naming mismatch; hero is jargon |

**Stranger-speed:** CALBOK ≈5 s; Countersign ≈6 s; AFTERMATH ≈8 s; us — **not established**
(jargon-first hero; no named user; outcome unstated).

## R2 — Transferable patterns (judge-axis impact ÷ hours here)

| # | Pattern | Impact ÷ hours | Est. |
|---|---|---|---|
| 1 | Live thing above the fold (CALBOK feed; Countersign /proof; RIMBA reef) | 30+20 / 3–4 h | live-verdict panel (R7) |
| 2 | Name the user + job (CALBOK callers; Countersign payees) | 20 / 0.5 h | hero rewrite |
| 3 | Proof above claims (blob lineage up top) | 30 / 1 h | learning strip |
| 4 | Ship video+blog before deadline | 20 / 3 h | record, post (owner) |
| 5 | CLAIMS.md ledger in-repo | 30 / 1 h | commit |
| 6 | One-line outcome typography | 20 / in #2 | copy |
| 7 | /api/status page | 10 / cut | CUT |
| 8 | OG image for share bonus | 10 / 1 h | SVG |
| 9 | MCP-first quickstart | keep | — |
| 10 | Honest “not finished” block | 30 / 0 h | surface |

**Do-not-copy list:** CALBOK: lock→settle→remember→recall copy, public-feed claims structure, blob
proof documents, caution-loop tables, any assets/logos. RIMBA: naturalist persona, jellyfish/reef
visuals, animated SVG hero, `pnpm verify` naming. Countersign: provenance protocol wording
(VERIFIED/STATED), payee attack-lab text, /status layout. AFTERMATH: incident-lifecycle names,
"a claim is not evidence" (their exact line). **No code, assets, or sentence-level wording from any of
them.**

**The single move that closes our largest gap:** make the homepage show one **real, clickable,
live-Tatum-or-snapshot WITHHELD verdict above the fold, tied to a named user** — it converts our
invisible engineering depth into the judging currency (30% integration + 20% presentation) in under
a day, without new machinery.

## R3 — Rules (read live, today)

VERIFIED against event rules (wal.app) + official landing (recall-tatum-walrus.vercel.app) + Tatum
page + HackList/community mirrors:

- Deadline **Nov 10 2026 17:00 UTC**; results Nov 17; one entry/person; 18+; original, materially advanced in-window.
- **Special awards stack with track prizes** ("bonuses on top"; confirmed via event page + mirrors) — VERIFIED.
- **Best Walrus Memory** $500 — "deepest learning loop; memories that visibly change the product"; Walrus team picks.
- **Best Tatum AI Builder App** $500 — "best **shippable** product built primarily with ai.tatum.io" — NOT merely "we used Tatum MCP" (INFERRED).
- **Best Use of Agent Payments** $500 — x402/MPP on Sui — **UNREACHABLE for us** this cycle (no payments).
- **Mystery Bounty** $500 — VERIFIED to exist; content UNKNOWN (Discord reveal).
- Judging: 30/30/20/20. Bonus: share on X/LinkedIn; tag @Tatum_io @WalrusFoundation optional.
- Requirements: Walrus Memory on Mainnet; Tatum RPC "where relevant"; ≥10 memories; published blog; demo + public repo. AI Builder optional.
- Rule changes since 2026-11-04: **none detected**. Timezone UTC confirmed. Gateway-only builds compete equally.
- "Tatum AI Builder experience?" → answer truthfully: not used.

## R4 — Tatum MCP (@tatumio/blockchain-mcp)

VERIFIED: v1.0.5, MIT, tatumio/blockchain-mcp (15★, pushed 2026-06-01, Node ≥18, **no postinstall**),
13 tools, **no Sui-native tools** — Sui would ride `gateway_execute_rpc`; SDK dep `^0.5.0` (2024-era,
spec drift), `axios ^1.6.0` (stale). Free-tier limits UNKNOWN (anonymous GraphQL: 429 @5/min — R7).
**SKIP as backend** (saves 2–6 h; avoids 429/de-risk; AI-Builder award is for ai.tatum.io products,
not this MCP — INFERRED). Keep our GraphQL; cite this audit.

## R5 — Sources & skills (install NOTHING)

| URL | Owner / activity | Pin | Licence | Last | Read | Risks | Install? |
|---|---|---|---|---|---|---|---|
| anthropics/skills (frontend-design, mcp-builder, webapp-testing, theme-factory) | anthropics official; pushed 2026-11-06 | 2c5958e | none (all rights reserved) | 2026-11-06 | SKILL.md tops | licence absent → reference-only | **N** |
| modelcontextprotocol/specification | official org; pushed 11-08 | 94f4ebc | MIT→Apache-2.0 (transition) | 2026-11-08 | spec 2025-06-18 | noise; readable | **N** |
| modelcontextprotocol/typescript-sdk | official org; pushed 11-05 | 1e608ca | MIT/Apache-2.0 | 2026-11-05 | types; we use 1.32.2 | none; keep dep | **N (dep already)** |
| modelcontextprotocol/servers | official org; pushed 11-05 | 3638028 | MIT/Apache-2.0 | 2026-11-05 | server patterns | none | **N** |
| docs.tatum.io | Tatum; pages updated 2026-10-08 | n/a | docs | 2026-10 | Sui = Tier 2 | may lag dashboard | **N** |
| wal.app event rules + docs.wal.app | Walrus Foundation | n/a | docs | 2026-11 | rules/weights/Memory docs | none | **N** |
| dequelabs/axe-core | dequelabs; pushed 11-05 | c50bf8e | MPL-2.0 | 2026-11-05 | WCAG 2.2 rules | copyleft if vendored | **N** |
| alphagov/govuk-frontend | alphagov; pushed 11-06 | c2c62db | MIT | 2026-11-06 | restrained type/layout | public-sector skin only | **N** |
| primer/css | GitHub; pushed 11-08 | 25bee49 | MIT | 2026-11-08 | contrast/util classes | GitHub look | **N** |

Discipline needed = type scale, spacing, ≤1 accent, tables-over-cards (govuk-frontend/primer show it).
Vercel caching: cite official docs + vercel/vercel @84878e5 (static files, HTML no-store). A11y:
static axe-core ruleset check (no install); report's checklist suffices for a 4-page site.

## R6 — Stranger audit of our own live site (VERIFIED 10:11–10:12 UTC)

Live: 5/5 URLs **200**; export hash-verified; 0 external resources; skip-link/aria-current present.
Five-second test: promise lands, **who/why absent**; demo one click away, not in place; og:image missing.

Frictions: (1) repo/package/hosted-name mismatch (judges see `freshness-bound-recall` vs
`RecallGuard`/`recallguard` within one click); (2) jargon above the fold, no plain-terms one-liner,
no named user; (3) no og:image → share bonus unsupported; (4) zero live proof — every number a
frozen cache; (5) demo requires a click; no auto-advance; (6) evidence page pushes tables before
context; (7) MCP page shows tool JSON, not an agent transcript; (8) README still mechanism-before-user;
(9) CLI help vs docs wording drift; (10) 390 px cells tight at 9 px mono.

Judge-catchable claims: x-api-key counts (recorded log — fine); export byte-identity — **VERIFIED**;
16/16 MCP + 9/9 smoke — VERIFIED; 149 tests — VERIFIED at HEAD; hosted page identity — VERIFIED;
“no network requests” — **INFERRED** (source scan only; no browser available); live CLI — labelled.

## R7 — Live check design

**Probes (today, no key):** anonymous `POST …/graphql` → **200** for `{checkpoint{…}}`, then
**429 "5 requests per minute… upgrade to a Paid plan"** (text captured). OPTIONS → **204**, ACAO
**echoes any Origin**, methods POST/GET/PUT/DELETE allowed. `checkpoints(last:1)` returned a stale
**237,661,232** vs `checkpoint{…}` **342,963,742 → …774** — the `last` root is untrustworthy
anonymously. Paid plan: 200 rps (per 429 text).

**Credits/call: UNKNOWN** (needs dashboard; cannot measure from here). **Steps (~10 min):**
(1) dashboard → Usage for the key, export 48 h; (2) note counter, run 3 controlled calls
(checkpoint + object pin + type); (3) re-check after 15 min; (4) subtract baseline; (5) record
`credits/call` in CLAIMS.md; (6) re-measure post-deploy. If per-request data absent: mark UNKNOWN,
cap demo at 3 live calls/page-open.

**A — browser→Tatum anonymous:** 0.5–1 h; keyless; 5 rpm per visitor; (i) stale root anomaly; (ii)
office/judge NAT already 429 today; (iii) ACAO echo for any origin (abuse-able); (iv) no server
cache; (v) no cost control.
**B — Vercel function proxy (key server-side):** 3–5 h; reuse `src/tatum.mjs`; 1 s cache; **daily
cap** env `TATUM_SMOKE_DAILY_CAP`=25; **kill switch** `LIVE_CHECK=off`; `s-maxage=2, swr=60`; per-IP
bucket; fixed query set; errors → bundled snapshot silently; no key in response; count-only logs.

**Fallback:** snapshot card renders identically; badge flips to "REPLAY (offline snapshot)".
**Recommendation: B** — caching, cost control and a kill switch separate "live" from "flaky";
an anonymous free tier already throttled us to 429 mid-research. A is viable only as a behind-B
progressive enhancement.

## R8 — Use cases (persona = HYPOTHESIS; no invented metrics)

1. **Treasury/ops agent paying a vendor** — recalled “allowance to Spender X still active (vN)”; spender revoked at vN+1 → agent routes payment down a dead path. *HYPOTHESIS.*
2. **Support agent triaging** — recalled “contract Y paused at vP”; flag flipped yesterday; response delayed on a stale “all clear”. *HYPOTHESIS.*
3. **Wallet/delegate rotation (hero)** — recalled “delegate key D still authorized (registry pin P)”; owner rotated D yesterday; agent writes to a dead namespace and keeps serving stale evidence. *HYPOTHESIS — exactly our recorded objects.*

**Hero:** stripped-down “treasury watcher” agent; every onchain fact it recalls is a FR-v1 memory
gated against the pin before it recommends. Shown with the real Mainnet subjects in our 22 memories —
Sui **Clock** `0x0…06` (FAST) and **MemWal AccountRegistry** `0x8bf8…9f9f` (SLOW). Judges watch
WITHHELD → FRESH across the recorded correction instead of an abstract proof. No payments involved.
Counterfactual stays a modelled analysis, never an incident.

**Four-line quote request (fill in once, no metrics invented):**

> Hey [first name] — I'm building RecallGuard for the Tatum×Walrus Total Recall (Nov 10, 17:00 UTC).
> The claim: an agent that remembers a revoked onchain allowance will act on it, and nothing today
> stops it. Would you give me one honest sentence on whether that's a real pain or not — quoted with
> your name/company in the README? "Yes" and "no" both help; no numbers needed, just your call.
> Deadline for the quote is Monday; happy to send the demo link either way.

## Appendix A — Fetch log (09:5x–10:15 UTC, read-only, no keys)

Rules/landing: wal.app rules page; recall-tatum-walrus.vercel.app (rewards, checklist, judging); tatum.io/hackathon/total-recall (shell); HackList + community mirrors (stacking). Repos: 0xileri/CALBOK (41 memories, blob IDs, video, blog); itzebe/aftermath (Medium + captioned video); Makami27/countersign (nittings.xyz 200; 71 tests; 12 mainnet memories); edycutjong/rimba (MIT; 11/08 push; CI; memory = stand-in); PugarHuda/invoice-chaser; ONOSPETER/WalSniff (SPAs, thin); 0xkenichi/tideover (blog); AshThunder/spend-aware-agent; Tolex081/sui-money-total-recall (all 200); UyLeQuoc/remora (no demo); 0xileri/CALBOK no licence; aftermath/countersign no licence; rimba MIT. mrnetwork0001 (100 repos, no TR entry); Enoch208 (no TR entry). Tatum anonymous GraphQL: 429 (5/min, text captured); ACAO echoes any Origin; `checkpoints(last:1)` returns a stale root; `checkpoint{sequenceNumber}` advances (342,963,742 → …774 across probes). Our site 5/5 URLs 200; og:image absent; 0 external resources; skip-link/aria-current/focus-visible present. anthropics/skills @ 2c5958e (no licence); modelcontextprotocol spec/SDK/servers (Nov 2026); axe-core @ c50bf8e (MPL-2.0); govuk-frontend @ c2c62db (MIT); primer/css @ 25bee49 (MIT); walrus @ f91ade7 + memwal @ 06c3326 (Apache-2.0); tatumio/blockchain-mcp v1.0.5 (MIT).

// RecallGuard homepage — user-first, live-verdict panel, no network until JS.

import { GITHUB_REPO, esc, short, shell } from "./layout.mjs";
import { selectRecordedRevisionLifecycle } from "../../src/recorded-lifecycle.mjs";
import { comparePolicyWindows, recordedPolicyEffect } from "../../src/policy-effect.mjs";
import { computeAblation } from "./ablation.mjs";
import { RECORDED, SNAPSHOT_CHECKPOINT, SNAPSHOT_GENERATED_AT } from "../../api/recorded-evidence.mjs";

const REPO_SNAPSHOT = `${GITHUB_REPO}/blob/main/docs/evidence/proof-snapshot.json`;
const WALRUS_READ = (blob) => `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${blob}`;

export function homePage(snapshot) {
  const lifecycle = selectRecordedRevisionLifecycle(snapshot);
  const policyEffect = recordedPolicyEffect(snapshot);
  const storedSlowPolicy = (snapshot.memories || []).find((memory) => (
    memory.predicate === "policy_window" && memory.class === "SLOW" && Number(memory.policy?.window) === 20000
  ));
  const storedFastPolicy = (snapshot.memories || []).find((memory) => (
    memory.predicate === "policy_window" && memory.class === "FAST"
  ));
  const policyComparison = comparePolicyWindows(policyEffect, { newWindow: Number(storedSlowPolicy?.policy?.window ?? 20000) });
  const ablationSummary = computeAblation(snapshot);

  // Panel pre-render: the snapshot verdict (both subjects stale at snapshot time).
  const fastRecorded = RECORDED.fast.memory;
  const slowRecorded = RECORDED.slow.memory;
  const fastSnapshotPin = RECORDED.fast.snapshot_pin;
  const slowSnapshotPin = RECORDED.slow.snapshot_pin;

  const subjectCard = (key, recorded, pin) => {
    const stale = String(recorded.version) !== String(pin.version) || String(recorded.digest) !== String(pin.digest);
    const isFast = key === "fast";
    return `
      <article class="lv-card" data-subject="${key}" aria-labelledby="lv-${key}-title">
        <div class="lv-card-head">
          <h3 id="lv-${key}-title">${isFast ? "Sui Clock · <code>0x000…0006</code>" : "MemWal AccountRegistry · <code>0x8bf8…9f9f</code>"}</h3>
          <span class="pill ${stale ? "pill-accent" : ""}" data-role="verdict-pill">${stale ? "STALE — withheld" : "FRESH — usable"}</span>
        </div>
        <dl class="kv-list lv-facts">
          <div><dt>Recorded memory</dt><dd><code data-role="claim">${esc(recorded.claim)}</code><br><a href="${WALRUS_READ(recorded.blob_id)}" rel="noopener">${esc(short(recorded.blob_id, 20))}</a> · cp ${esc(recorded.checkpoint)} · v ${esc(recorded.version)}</dd></div>
          <div><dt>Live read</dt><dd><code data-role="live">v ${esc(pin.version)} · cp ${esc(pin.checkpoint)}</code><br><span class="muted" data-role="live-meta">snapshot 2026-11-05T14:36Z · delta ${esc(pin.checkpoint - recorded.checkpoint)} checkpoints</span></dd></div>
          <div><dt>Verdict</dt><dd><span data-role="verdict-glyph" aria-hidden="true">${stale ? "✕" : "✓"}</span> <strong data-role="verdict-text">${stale ? "STALE — memory withheld" : "FRESH — memory usable"}</strong><br><span class="muted" data-role="verdict-reason">subject changed (version ${esc(recorded.version)}→${esc(pin.version)})</span></dd></div>
        </dl>
      </article>`;
  };

  const body = `
  <section class="hero-grid" aria-labelledby="hero-title">
    <div>
      <p class="eyebrow">For agents on Walrus Memory</p>
      <h1 id="hero-title">Your agent remembers.<br>RecallGuard checks whether it&rsquo;s still true.</h1>
      <p class="hero-intro">Agents act on what they remember: a key still authorized, an allowance still active. If the chain has moved on, they act on a fact that is no longer true. RecallGuard checks the memory against live Sui state through Tatum first, withholds the answer if it is stale, and writes the corrected fact back to Walrus Memory.</p>
      <div class="hero-actions">
        <a class="button button-primary" href="#live-verdict">Check a memory live</a>
        <a class="button" href="/mcp.html">Add it to your agent (MCP)</a>
      </div>
      <p class="muted" style="margin-top:14px">Read-only · no wallet · fails closed · no LLM in the answer path</p>
    </div>
    <aside class="card example-card" aria-labelledby="example-title">
      <p class="eyebrow" style="margin-bottom:8px">Example — hypothetical, not a recorded incident</p>
      <h2 id="example-title" style="font-size:19px;margin-bottom:10px">The treasury agent and the rotated delegate key</h2>
      <p class="secondary" style="font-size:13.5px;margin-bottom:10px">An ops agent remembered that delegate key <code>D</code> may still sign for the treasury account — a fact it wrote to Walrus Memory last week. Overnight, the owner rotated the delegate. The agent wakes, recalls the old fact, and reaches for a payment workflow it should never touch.</p>
      <p class="secondary" style="font-size:13.5px;margin-bottom:0">RecallGuard reads the memory before the action and finds the AccountRegistry pin has advanced: <strong>WITHHELD</strong>. The agent gets the verified current pin instead, opens the correction lineage, and the superseding fix is already waiting in the next interaction. This is the failure class our recorded memories document — not an incident that has happened.</p>
      <p class="muted" style="margin:12px 0 0">Persona and scenario are a hypothesis; the subject objects are real Mainnet objects shown below.</p>
    </aside>
  </section>

  <section class="section live-verdict" id="live-verdict" aria-labelledby="lv-title">
    <div class="lv-head">
      <div>
        <p class="eyebrow">Live check</p>
        <h2 id="lv-title">Two recorded memories, checked against the chain right now</h2>
      </div>
      <div class="lv-status">
        <span class="status status-snapshot" id="lv-badge">REPLAY · snapshot</span>
        <span class="muted" id="lv-read">read — at checkpoint ${esc(SNAPSHOT_CHECKPOINT.checkpointSeq)}</span>
      </div>
    </div>
    <div class="lv-grid">
      ${subjectCard("fast", fastRecorded, fastSnapshotPin)}
      ${subjectCard("slow", slowRecorded, slowSnapshotPin)}
    </div>
    <p class="muted lv-note">The verdict is computed from live Tatum Sui Mainnet GraphQL reads at click time — never hardcoded. Without network or credentials, this panel renders the labelled 2026-11-05 recorded snapshot verdicts (both withheld: both subjects moved). Verdicts are also shown by glyph (✓/✕) and text, never by colour alone. Live reads are rationed server-side; if the live path is unavailable you get the same panel from the snapshot.</p>
    <div class="detail">
      <p class="muted" style="margin-bottom:6px"><strong>The loop, end to end</strong></p>
      <p class="secondary" style="font-size:13px;margin:0">WITHHELD → a correction memory supersedes the stale one (<code>cor-sui-clock-341742463</code> → <code>obs-sui-clock-341742424</code>, <code>supersedes</code> lineage) → the next recall answers with the corrected fact. Policy memories (<code>fc-policy-FAST-v1</code>, <code>fc-policy-SLOW-v2</code>) already learned from recorded decay: FAST window tightened 50→25 after 3 missed changes, SLOW window widened 10,000→20,000 after 6 false-stale reads. Deterministic replays — see <a href="/evidence.html#learning-loop">the evidence page</a>.</p>
    </div>
    <script>
      (function () {
        var badge = document.getElementById("lv-badge");
        var read = document.getElementById("lv-read");
        function glyph(stale) { return stale ? "✕" : "✓"; }
        function timeAgo(iso) {
          var s = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
          if (s < 60) return s + " s";
          var m = Math.floor(s / 60);
          return m + " min";
        }
        function apply(subject, key) {
          var card = document.querySelector('[data-subject="' + key + '"]');
          if (!card || !subject) return;
          var stale = subject.verdict === "STALE";
          card.querySelector('[data-role="verdict-pill"]').textContent = stale ? "STALE — withheld" : "FRESH — usable";
          card.querySelector('[data-role="verdict-pill"]').classList.toggle("pill-accent", stale);
          card.querySelector('[data-role="claim"]').textContent = subject.recorded.claim;
          card.querySelector('[data-role="live"]').textContent = "v " + subject.live.version + " · cp " + subject.live.checkpoint;
          card.querySelector('[data-role="live-meta"]').textContent = subject.live.source === "live" ? "read at " + subject.live.readAt : "snapshot " + (subject.live.readAt || "");
          card.querySelector('[data-role="verdict-glyph"]').textContent = glyph(stale);
          card.querySelector('[data-role="verdict-text"]').textContent = stale ? "STALE — memory withheld" : "FRESH — memory usable";
          card.querySelector('[data-role="verdict-reason"]').textContent = subject.reason || "";
        }
        fetch("/api/live-verdict", { headers: { accept: "application/json" } })
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (payload) {
            if (!payload || !payload.subjects) throw new Error("bad payload");
            apply(payload.subjects.fast, "fast");
            apply(payload.subjects.slow, "slow");
            if (payload.source === "live") {
              badge.textContent = "LIVE · Tatum";
              badge.classList.remove("status-snapshot");
              badge.classList.add("status-live");
              read.textContent = "read " + timeAgo(payload.checked_at) + " ago at checkpoint " + payload.subjects.fast.live.checkpoint;
            } else {
              badge.textContent = "REPLAY · snapshot";
              read.textContent = "read " + timeAgo(payload.checked_at || "2026-11-05T14:36:57Z") + " ago at checkpoint " + (payload.snapshot_checkpoint || ${SNAPSHOT_CHECKPOINT.checkpointSeq});
            }
          })
          .catch(function () {
            badge.textContent = "REPLAY · snapshot";
            read.textContent = "live check unavailable — showing the recorded snapshot";
          });
      })();
    </script>
  </section>

  <section class="section" aria-labelledby="proof-strip-title">
    <p class="eyebrow">Recorded proof, not adjectives</p>
    <h2 id="proof-strip-title">Twenty-two memories on Mainnet, and they changed the product</h2>
    <div class="proof-strip" role="list" aria-label="Recorded proof points">
      <div class="proof-item" role="listitem"><span class="proof-num">22</span><span class="proof-label">memories on Walrus Mainnet · namespace <code>freshness-recall</code></span></div>
      <div class="proof-item" role="listitem"><span class="proof-num">306</span><span class="proof-label">checkpoint-stamped decisions, all recorded</span></div>
      <div class="proof-item" role="listitem"><span class="proof-num">3</span><span class="proof-label">MISSED-CHANGE samples → FAST window tightened 50→25<br><a href="${WALRUS_READ(storedFastPolicy?.blob_id ?? "")}" rel="noopener">fc-policy-FAST-v1</a></span></div>
      <div class="proof-item" role="listitem"><span class="proof-num">6</span><span class="proof-label">FALSE-STALE samples → SLOW window widened 10,000→20,000<br><a href="${WALRUS_READ(storedSlowPolicy?.blob_id ?? "")}" rel="noopener">fc-policy-SLOW-v2</a></span></div>
    </div>
    <p class="muted" style="margin-top:12px">Blob links open the raw memory over the official Walrus aggregator read path. Counts are the committed capture (2026-11-05). The modelled counterfactual split stays on the <a href="/evidence.html">evidence page</a>.</p>
  </section>

  <section class="section" id="try-it" aria-labelledby="how-title">
    <p class="eyebrow">How it works</p>
    <h2 id="how-title">One gate between recall and action</h2>
    <div class="grid" role="list" style="margin-top:18px">
      <article class="card" role="listitem"><p class="mono-tag" style="color:var(--muted)">01 · RECALL</p><h3>Agent remembers</h3><p class="secondary" style="font-size:13px;margin:8px 0 0">The agent recalls a Walrus-backed memory with its FR-v1 proof envelope: checkpoint, object version and digest at write time.</p></article>
      <article class="card" role="listitem"><p class="mono-tag" style="color:var(--muted)">02 · VERIFY</p><h3>Tatum checks Sui</h3><p class="secondary" style="font-size:13px;margin:8px 0 0">One cached checkpoint read and one subject pin read through Tatum&rsquo;s Sui Mainnet GraphQL. At most two reads per answer, ever.</p></article>
      <article class="card" role="listitem"><p class="mono-tag" style="color:var(--muted)">03 · DECIDE</p><h3>Gate decides</h3><p class="secondary" style="font-size:13px;margin:8px 0 0">Checkpoint window ∧ object version/digest pin ∧ wall-clock backstop. Any missing or malformed proof fails closed: WITHHELD_UNVERIFIED.</p></article>
      <article class="card" role="listitem"><p class="mono-tag" style="color:var(--muted)">04 · CORRECT</p><h3>Correction supersedes</h3><p class="secondary" style="font-size:13px;margin:8px 0 0">When the pin changed, a correction memory supersedes the old record with explicit <code>supersedes</code> lineage. Later recalls use the corrected memory.</p></article>
    </div>
  </section>

  <section class="section try-it" aria-labelledby="sixty-title">
    <p class="eyebrow">60-second quickstart</p>
    <h2 id="sixty-title">Run the recorded revision lifecycle</h2>
    <div class="command-card" style="margin-top:14px;max-width:760px">
      <div class="command-head"><span>Terminal · no credentials, no network</span><button class="copy-button" type="button" data-copy-target="quickstart">Copy</button></div>
      <pre><code id="quickstart">git clone ${GITHUB_REPO}
cd recallguard
npm install --ignore-scripts
npm run recall:checked -- --sample sui-clock-revision-lifecycle</code></pre>
    </div>
    <p class="muted" style="margin-top:10px">Prints <code>STALE → FRESH → STALE</code> with the real blob ids and checkpoints. See <a href="/docs.html">docs</a> for the MCP server, CLI flags and the JavaScript API.</p>
    <script>
      document.querySelectorAll("[data-copy-target]").forEach(function (button) {
        button.addEventListener("click", async function () {
          var target = document.getElementById(button.dataset.copyTarget);
          try { await navigator.clipboard.writeText(target ? target.textContent.trim() : ""); button.textContent = "Copied"; }
          catch (e) { button.textContent = "Select and copy"; }
        });
      });
    </script>
  </section>

  <section class="section" aria-labelledby="integrations-title">
    <p class="eyebrow">Three surfaces, one gate</p>
    <h2 id="integrations-title">Use it from your agent, your terminal, or your code</h2>
    <div class="grid" role="list" style="margin-top:18px">
      <article class="card" role="listitem"><p class="mono-tag" style="color:var(--muted)">MCP</p><h3>MCP-native</h3><p class="secondary" style="font-size:13px">Six tools over stdio; read-only by default. Verified with Claude Code and Codex.</p><p style="margin:12px 0 0"><a href="/mcp.html">MCP setup →</a></p></article>
      <article class="card" role="listitem"><p class="mono-tag" style="color:var(--muted)">CLI</p><h3><code>recallguard</code></h3><p class="secondary" style="font-size:13px"><code>--sample sui-clock-changed</code> replays recorded Mainnet evidence offline. <code>--live</code> reads Walrus + Tatum with your credentials; writes need <code>--allow-mainnet-writes</code>.</p><p style="margin:12px 0 0"><a href="/docs.html#cli">CLI reference →</a></p></article>
      <article class="card" role="listitem"><p class="mono-tag" style="color:var(--muted)">JAVASCRIPT API</p><h3><code>recallChecked()</code></h3><p class="secondary" style="font-size:13px">Stable <code>recall_checked/v1</code> contract. Dependency-injected store and Tatum transport; writes off unless <code>allowWrites: true</code>.</p><p style="margin:12px 0 0"><a href="/docs.html#api">API reference →</a></p></article>
    </div>
  </section>

  <section class="section" aria-labelledby="evidence-cta-title">
    <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap">
      <div><p class="eyebrow" style="margin-bottom:6px">Evidence, not adjectives</p><h2 id="evidence-cta-title" style="margin-bottom:6px">22 recorded Mainnet memories · 306 stamped decisions</h2><p class="section-copy" style="font-size:14px">Blob ids, checkpoint stamps, revision lineage, the learned-policy replay and the captured Tatum request log. The modelled counterfactual analysis stays on the evidence page — it is a modelled analysis of recorded decisions, not production incidents.</p></div>
      <a class="button" href="/evidence.html">Inspect the evidence →</a>
    </div>
  </section>
`;

  return shell({
    title: "RecallGuard · Your agent remembers. RecallGuard checks whether it's still true.",
    description: "Agents act on what they remember: a key still authorized, an allowance still active. RecallGuard checks each Walrus-backed memory against live Sui state through Tatum, withholds stale answers, and supersedes them with corrections. Read-only by default.",
    active: "/index.html",
    path: "/index.html",
    body,
  });
}

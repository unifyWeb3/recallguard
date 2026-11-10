// RecallGuard blog page: the published hackathon blog post.
// Content mirrors docs/blog.md; every number is replayable from the committed snapshot.

import { GITHUB_REPO, shell, esc } from "./layout.mjs";

const VIDEO_URL = "https://youtu.be/16bsUTPpyqw";
const LIVE_URL = "https://recallguard.vercel.app";

export function blogPage() {
  const body = `
  <section aria-labelledby="blog-title" style="padding-top:56px;max-width:920px">
    <p class="eyebrow">Blog · Tatum x Walrus Total Recall · Track 02: Smart Agents for Real Life</p>
    <h1 id="blog-title">Your agent made a call. Was it still true?</h1>
    <p class="secondary" style="font-size:14px;margin-bottom:0">Watch the two-minute demo: <a href="${VIDEO_URL}" rel="noopener">youtu.be/16bsUTPpyqw</a> · Repo: <a href="${GITHUB_REPO}" rel="noopener">github.com/unifyWeb3/recallguard</a> · Live: <a href="${LIVE_URL}" rel="noopener">recallguard.vercel.app</a></p>
  </section>

  <section class="section" style="max-width:920px">
    <p>An ops agent recalled last week that a delegate key was authorized. The account moved overnight.
    The agent woke, retrieved the memory, and reached for the payment workflow it should not touch,
    because nothing in a plain vector recall knows the chain moved on.</p>
    <p>That is the failure RecallGuard exists to catch. Every memory the agent uses is checked against
    live Sui state before it can become an answer. If the chain has moved on, the answer is withheld;
    the verified value is used instead. RecallGuard is a small, deterministic gate; there is no LLM
    between recall and the verdict. There never will be one in the answer path.</p>
    <p>This is what one real recorded failure looks like:</p>
    <pre><code>recall_checked: obs-sui-clock-341742463
  Walrus blob proof   checkpoint 341742463 · version 1018797298
  Tatum verification  checkpoint 341868687 · version 1019267077, digest changed
  verdict             WITHHELD: the old memory was not used as the answer</code></pre>
  </section>

  <section class="section" style="max-width:920px">
    <p class="eyebrow">How it works</p>
    <h2>What the gate does, in four steps</h2>
    <ol class="secondary" style="padding-left:20px;display:grid;gap:8px;margin-top:14px">
      <li>Recall a candidate from Walrus Memory.</li>
      <li>Load the freshness policy for that claim class (from Walrus, not from a hidden constant).</li>
      <li>Read the latest Sui checkpoint and the subject's version/digest through Tatum Sui Mainnet GraphQL: at most two reads per answer, one of them cached for a second.</li>
      <li>Return the memory only if the checkpoint window, object version/digest, and wall-clock backstop all pass. Anything else fails closed.</li>
    </ol>
  </section>

  <section class="section" style="max-width:920px">
    <p class="eyebrow">The learning loop</p>
    <h2>The memories that changed the product</h2>
    <p>RecallGuard's tolerance is itself a memory. Two per-class policy records live in Walrus Memory and were read back before every decision:</p>
    <div class="scroll" tabindex="0" role="region" aria-label="Policy memories" style="margin-top:12px">
      <table>
        <thead><tr><th scope="col">Class</th><th scope="col">Recorded learning</th><th scope="col">Persisted policy memory</th></tr></thead>
        <tbody>
          <tr><td>FAST: Sui Clock</td><td>50 → 25 after 3 <code>MISSED-CHANGE</code> signals</td><td><code>fc-policy-FAST-v1</code>, blob <code>19ZE9y-zWt1fuR3lryI3AZiqM-v-cloWw7_oXHGOU4o</code></td></tr>
          <tr><td>SLOW: MemWal AccountRegistry</td><td>5,000 → 10,000 → 20,000 from <code>FALSE-STALE</code> signals</td><td><code>fc-policy-SLOW-v2</code>, blob <code>Zne2mnjAy6uOtOhJ6o5QAxH963EqXQaMMtYWOPBkK_4</code></td></tr>
        </tbody>
      </table>
    </div>
    <p style="margin-top:12px">Same recorded inputs, two policies: the verdict flips on the delta alone.</p>
    <div class="scroll" tabindex="0" role="region" aria-label="Verdict comparison" style="margin-top:12px">
      <table>
        <thead><tr><th scope="col">Policy used for the same evidence</th><th scope="col">Verdict</th></tr></thead>
        <tbody>
          <tr><td>Built-in 5,000-checkpoint default</td><td><code>STALE / FALSE-STALE</code>: delta 18,155 exceeded the window</td></tr>
          <tr><td>20,000 from the Walrus policy memory</td><td><code>FRESH / CONSISTENT</code>: delta fits the learned window, pin unchanged</td></tr>
        </tbody>
      </table>
    </div>
    <p class="muted" style="margin-top:12px">This is a deterministic replay of a real recorded decision; the window is the only changed input. It is policy evaluation, not autonomous learning.</p>
  </section>

  <section class="section" style="max-width:920px">
    <p class="eyebrow">117 seconds to stale</p>
    <h2>A real revision can age before persistence</h2>
    <p>The recorded lifecycle says <code>STALE → FRESH → STALE</code> precisely:</p>
    <ul class="secondary" style="padding-left:20px;display:grid;gap:8px">
      <li>the predecessor observation was stale and withheld;</li>
      <li>the correction evaluates fresh at its own proof time;</li>
      <li>the same proof evaluates stale at the first later recorded check.</li>
    </ul>
    <p>The correction took 117,242 ms to persist to Walrus; the first later check (1,381 ms) already found
    the subject changed. The historical later event recalled proof-equivalent observation
    <code>zAji1w8p4REMzUF2o1V7IfgfQlpN7np7Qs8ehtNVXHg</code>, not the correction blob itself. The contract states
    that distinction instead of implying otherwise. Both blobs, and every number on this page, are
    replayable from the committed snapshot, or read directly through the official aggregator read path
    (<code>https://aggregator.walrus-mainnet.walrus.space/v1/blobs/&lt;BLOB_ID&gt;</code>).</p>
  </section>

  <section class="section" style="max-width:920px">
    <p class="eyebrow">MCP</p>
    <h2>The MCP server</h2>
    <p>RecallGuard is not only a CLI. It speaks MCP over stdio, so Claude Code, Codex or any compatible agent gates its own onchain claims:</p>
    <pre><code>claude mcp add recallguard -- node /absolute/path/to/recallguard/scripts/recallguard-mcp.mjs
recallguard-mcp   # tools: recall_checked, explain_decision, list_revisions,
                  #          get_evidence, propose_correction, store_correction</code></pre>
    <p class="secondary">Read-only by default. <code>store_correction</code> refuses to write unless <code>RECALLGUARD_ENABLE_WRITES=true</code>
    <strong>and</strong> the per-call literal <code>confirm="STORE-CORRECTION"</code> <strong>and</strong> live mode is configured. Recalled
    memory content is treated as untrusted data everywhere: parsed fields only, never instructions.</p>
  </section>

  <section class="section" style="max-width:920px">
    <p class="eyebrow">What Tatum does</p>
    <h2>Chain truth, not vibes</h2>
    <p>Tatum is the chain-truth layer for the gate: the current Sui checkpoint sequence/digest, and the
    current version and digest of the subject object. Every read attaches <code>x-api-key</code> on every measured
    request (21/21 in the controlled run, 7/7 in the final snapshot, 2,208/2,208 in the longer page
    run); the plan header is observed; at most two reads per answer; exponential backoff on 429 and
    timeouts; fail-closed on anything missing or malformed.</p>
    <p>The installable live read-only CLI has one verified end-to-end Mainnet run (2026-11-10): the
    credential self-test passed 6/6, 22 memories were listed, and a Sui Clock query returned
    STALE/withheld with zero writes at checkpoint 343645577. The hosted page is a labelled static
    snapshot, not a live service. Everything labelled "recorded" is captured Mainnet evidence; "offline"
    is a deterministic replay of that evidence; "live" requires your own credentials; and the 214 changed,
    16 unchanged-but-old, 4 unverified split is a modelled counterfactual analysis of the 306 recorded
    decisions: not production incidents.</p>
  </section>

  <section class="section" style="max-width:920px">
    <p class="eyebrow">Honest limits</p>
    <h2>What this release does not claim</h2>
    <ul class="secondary" style="padding-left:20px;display:grid;gap:8px">
      <li>The live read-only installable CLI is verified for one Mainnet run (2026-11-10). This does not cover the live write path, other queries, or continuous availability.</li>
      <li>The MCP path is verified by 16 protocol-level tests and a real stdio smoke client; its live mode uses the same read-only gate and remains read-only by default.</li>
      <li>The observer later learned a SLOW window of 40,000 that was never persisted. The stored policy remains 20,000, tighter and more conservative. FAST (25) is cadence-limited below its sampling interval, so that learning loop is effectively frozen.</li>
      <li>Exact Walrus blob retention is unknown because <code>end_epoch</code> was not available through the tools used for this project. The committed snapshot remains reproducible offline.</li>
      <li>No user study has validated the proposed treasury/ops persona. The scenario on the site is labelled hypothetical.</li>
      <li>Walrus proves a blob exists; it does not prove a fact is current. That is the gate's job.</li>
      <li>Tatum AI Builder was not used. This project uses Tatum's Sui Mainnet GraphQL gateway only.</li>
    </ul>
  </section>

  <section class="section" style="max-width:920px">
    <p class="eyebrow">Try it</p>
    <h2>60 seconds, zero credentials</h2>
    <div class="command-card" style="margin-top:14px;max-width:860px">
      <div class="command-head"><span>Terminal · tested in a fresh clone</span></div>
      <pre><code>git clone https://github.com/unifyWeb3/recallguard
cd recallguard
npm install --ignore-scripts
npm run mcp:smoke
npm run recall:checked -- --sample sui-clock-revision-lifecycle</code></pre>
    </div>
    <p class="secondary" style="margin-top:12px">Watch the demo: <a href="${VIDEO_URL}" rel="noopener">youtu.be/16bsUTPpyqw</a> · Source: <a href="${GITHUB_REPO}" rel="noopener">${GITHUB_REPO.replace(/^https:\/\//, "")}</a> · Claim ledger: <a href="${GITHUB_REPO}/blob/main/CLAIMS.md" rel="noopener">CLAIMS.md</a></p>
  </section>
`;
  return shell({
    title: "Your agent made a call. Was it still true?",
    description: "RecallGuard checks Walrus-backed memories against live Sui state through Tatum before an agent acts. Stale or unverifiable memories are withheld, and corrections supersede them.",
    active: "/blog.html",
    path: "/blog.html",
    body,
  });
}

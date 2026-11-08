// Site tests: the four generated pages (home, MCP, evidence, docs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { page, pages } from "../scripts/proof-page.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const recorded = JSON.parse(readFileSync(resolve(ROOT, "docs/evidence/proof-snapshot.json"), "utf8"));

function staticSite() {
  const snapshot = structuredClone(recorded);
  snapshot.mode = "offline";
  snapshot.exported_at = new Date(Date.parse(snapshot.generated_at) + 60_000).toISOString();
  return pages(snapshot);
}
const home = (site) => site["/index.html"];
const mcp = (site) => site["/mcp.html"];
const evidence = (site) => site["/evidence.html"];
const docs = (site) => site["/docs.html"];

const skipLink = '<a class="skip-link" href="#main-content">Skip to main content</a>';

test("every page leads with a working skip link and the brand mark", () => {
  for (const [name, html] of Object.entries(staticSite())) {
    assert.ok(html.includes(skipLink), `${name} must carry the skip link`);
    assert.ok(html.indexOf(skipLink) < html.indexOf("<nav"), `${name}: skip link must come first`);
    assert.match(html, /class="brand-mark"/);
    assert.match(html, /<main class="shell" id="main-content" tabindex="-1">/);
    assert.match(html, /<meta property="og:title"/);
    assert.match(html, /<meta name="description"/);
    assert.doesNotMatch(html, /setTimeout|location\.reload/);
  }
});

test("homepage answers what-is-this in five seconds: named user, promise, actions", () => {
  const html = home(staticSite());
  assert.match(html, /For agents on Walrus Memory/);
  assert.match(html, /Your agent remembers\.<br>RecallGuard checks whether it&rsquo;s still true/);
  assert.match(html, /Check a memory live/);
  assert.match(html, /Add it to your agent \(MCP\)/);
  assert.match(html, /Read-only · no wallet · fails closed · no LLM in the answer path/);
  assert.match(html, /id="live-verdict"/);
  assert.match(html, /Agents act on what they remember: a key still authorized, an allowance still active/);
});

test("homepage shows the hypothetical treasury example, labelled as hypothetical", () => {
  const html = home(staticSite());
  assert.match(html, /hypothetical, not a recorded incident/i);
  assert.match(html, /rotated delegate key/i);
  assert.match(html, /AccountRegistry/);
  assert.match(html, /not an incident that has happened/i);
});

test("homepage live-verdict panel pre-renders both recorded subjects, snapshot verdicts", () => {
  const html = home(staticSite());
  const fast = html.split('data-subject="fast"')[1].split('data-subject="slow"')[0];
  const slow = html.split('data-subject="slow"')[1].split("</section>")[0];
  for (const [section, claim, blob, cp, version] of [
    [fast, "cor-sui-clock-341742463", "mjxZQ1X2xn5Xlvd-gBsBAIrD5rkUDwFCAn1NEX0gbWY", "341742463", "1018797298"],
    [slow, "obs-memwal-registry-341741030", "Pk3CAi9A0vLueqT8LGWS1zHoicYNSl7cUbXeAQFtF0g", "341741030", "1062994379"],
  ]) {
    assert.match(section, new RegExp(claim));
    assert.match(section, new RegExp(blob));
    assert.match(section, new RegExp("cp " + cp));
    assert.match(section, new RegExp("v " + version));
  }
  // verdicts rendered with glyph + text, never color alone
  assert.match(html, /✕/);
  assert.match(html, /STALE — memory withheld/);
  // panel hydrates from the API at view time
  assert.match(html, /fetch\("\/api\/live-verdict"/);
  assert.match(html, /LIVE · Tatum/);
  assert.match(html, /REPLAY · snapshot/);
  assert.match(html, /read .{0,12} at checkpoint/);
  // aggregator read path for blob links (verified official pattern)
  assert.match(html, /https:\/\/aggregator\.walrus-mainnet\.walrus\.space\/v1\/blobs\//);
});

test("homepage carries the exact credential-free 60-second replay command", () => {
  const html = home(staticSite());
  assert.match(html, /npm install --ignore-scripts/);
  assert.match(html, /npm run recall:checked -- --sample sui-clock-revision-lifecycle/);
  assert.match(html, /git clone https:\/\/github\.com\/unifyWeb3\/recallguard/);
  assert.match(html, /STALE/);
  assert.match(html, /FRESH/);
  assert.match(html, /navigator\.clipboard\.writeText/);
});

test("homepage proof strip shows recorded facts only, never the modelled split", () => {
  const html = home(staticSite());
  assert.match(html, />22</);
  assert.match(html, />306</);
  assert.match(html, /MISSED-CHANGE/);
  assert.match(html, /FALSE-STALE/);
  assert.match(html, /50→25/);
  assert.match(html, /10,000→20,000/);
  assert.doesNotMatch(html, /214/);
  assert.doesNotMatch(html, />16</);
  assert.doesNotMatch(html, />4</);
  assert.doesNotMatch(html, /214/);
});

test("evidence page labels every number: recorded, offline, live, modeled", () => {
  const html = evidence(staticSite());
  assert.match(html, /Recorded evidence/);
  assert.match(html, /Offline replay/);
  assert.match(html, /Live verification/);
  assert.match(html, /Modelled counterfactual|Modelled|counterfactual/i);
  assert.match(html, /Unverified end-to-end/i);
  assert.match(html, /existence, not current truth|not a claim that any fact is still true/i);
});

test("evidence page preserves blob ids, the learned policy replay and the outcome split", () => {
  const html = evidence(staticSite());
  assert.match(html, /Zne2mnjAy6uOtOhJ6o5QAxH963EqXQaMMtYWOPBkK_4/);
  assert.match(html, /Pk3CAi9A0vLueqT8LGWS1zHoicYNSl7cUbXeAQFtF0g/);
  assert.match(html, /fc-policy-SLOW-v2/);
  assert.match(html, /10[,.]?000\s*(?:→|-&gt;|to)\s*20[,.]?000/i);
  assert.match(html, />214</);
  assert.match(html, />16</);
  assert.match(html, />4</);
  assert.match(html, /deterministic policy evaluation, not autonomous learning/i);
});

test("evidence page shows connected correction pairs only, inventories collapsed", () => {
  const html = evidence(staticSite());
  const correctionsSection = html.split('aria-labelledby="corrections-title"')[1].split('aria-labelledby="pins-title"')[0];
  assert.doesNotMatch(correctionsSection, /smoke-seed/);
  assert.match(html, /class="correction-list"/);
  assert.match(html, /Recalled observation/);
  assert.match(html, /Recorded correction/);
  assert.match(html, /Latest 40 of 306 decisions/);
  assert.match(html, /blob/i);
  assert.match(html, /tabindex="0" role="region" aria-label="Memory inventory table"/);
  assert.match(html, /tabindex="0" role="region" aria-label="Latest decision ledger table"/);
  assert.match(html, /tabindex="0" role="region" aria-label="Tatum request log table"/);
  assert.match(html, /https:\/\/github\.com\/unifyWeb3\/recallguard\/blob\/main\/docs\/evidence\/proof-snapshot\.json/);
  assert.match(html, /x-api-key/);
  assert.doesNotMatch(html, /<th\b(?! scope="col")/);
});

test("evidence page uses one amber accent without gradients or haze", () => {
  const html = evidence(staticSite());
  assert.match(html, /--amber: #e5a83d/);
  assert.doesNotMatch(html, /gradient|box-shadow|--green|--red|backdrop-filter/i);
  const homeHtml = home(staticSite());
  assert.doesNotMatch(homeHtml, /gradient|box-shadow|--green|--red|backdrop-filter/i);
});

test("MCP page documents all six tools with read-only defaults and gating", () => {
  const html = mcp(staticSite());
  for (const tool of ["recall_checked", "explain_decision", "list_revisions", "get_evidence", "propose_correction", "store_correction"]) {
    assert.match(html, new RegExp(`<code>${tool}</code>`), `${tool} must be documented`);
  }
  assert.match(html, /RECALLGUARD_ENABLE_WRITES=true/);
  assert.match(html, /STORE-CORRECTION/);
  assert.match(html, /read-only by default/i);
  assert.match(html, /no wallet/i);
  assert.match(html, /untrusted data/i);
  assert.match(html, /withheld/i);
  assert.match(html, /Fail closed/i);
});

test("MCP page carries tested client configs for Claude Code and Codex", () => {
  const html = mcp(staticSite());
  assert.match(html, /claude mcp add recallguard/);
  assert.match(html, /v2\.1\.318/);
  assert.match(html, /codex-cli 0\.167\.0/);
  assert.match(html, /mcp_servers\.recallguard/);
  assert.match(html, /\.mcp\.json/);
  assert.match(html, /recallguard-mcp/);
  assert.match(html, /npm run mcp:smoke/);
  assert.match(html, /Troubleshooting/i);
  assert.match(html, /Claude Desktop and other clients.*not exercised/i);
});

test("docs page covers quickstart, CLI, API, architecture, security and honest limits", () => {
  const html = docs(staticSite());
  assert.match(html, /60 seconds/i);
  assert.match(html, /recallguard/);
  assert.match(html, /--allow-mainnet-writes/);
  assert.match(html, /--sample sui-clock-revision-lifecycle/);
  assert.match(html, /recallChecked/);
  assert.match(html, /recall_checked\/v1/);
  assert.match(html, /no LLM in the answer path/i);
  assert.match(html, /untrusted data/i);
  assert.match(html, /Signatures are <strong>not<\/strong> verified/);
  assert.match(html, /Live read-only CLI is unverified end-to-end/);
  assert.match(html, /Tatum AI Builder was not used/);
  assert.match(html, /fc-policy-SLOW-v2/);
  assert.match(html, /deterministic policy evaluation, not autonomous learning/i);
});

test("MCP and docs pages never print secrets and link the repo snapshot", () => {
  const site = staticSite();
  const all = Object.values(site).join("\n");
  assert.doesNotMatch(all, /suiprivkey1[0-9a-z]{32,}/i);
  assert.doesNotMatch(all, /PRIVATE KEY-----/);
  assert.match(all, /github\.com\/unifyWeb3\/recallguard/);
});

test("pages render with 390px-ready rules and keyboard-accessible scroll regions", () => {
  for (const [name, html] of Object.entries(staticSite())) {
    assert.match(html, /html, body \{ width: 100%; max-width: 100%;/, name);
    assert.match(html, /@media \(max-width: 720px\)/, name);
    assert.doesNotMatch(html, /<div class="scroll"(?! tabindex="0" role="region" aria-label=)/);
    assert.match(html, /\.skip-link \{[^}]*translateY\(-220%\)/, name);
  }
});

test("back-compat page() export still renders the home page", () => {
  const html = page(structuredClone(recorded));
  assert.match(html, /Your agent remembers\./);
});

// Shared site shell for RecallGuard static pages.
// Warm paper, near-black ink, one rust accent. Flat surfaces, hairline rules,
// serif display, mono metadata. Flat paper surfaces with no decorative effects.

export const GITHUB_REPO = "https://github.com/unifyWeb3/recallguard";
const REPO_SNAPSHOT = `${GITHUB_REPO}/blob/main/docs/evidence/proof-snapshot.json`;

export const esc = (s) => String(s ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");
export const short = (s, n = 14) => (s ? `${String(s).slice(0, n)}…` : "n/a");
export const fmtTime = (iso) => {
  const at = Date.parse(iso);
  return Number.isFinite(at) ? new Date(at).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC") : "unknown time";
};
export const fmtAge = (from, to = Date.now()) => {
  const start = Date.parse(from);
  const end = to instanceof Date ? to.getTime() : Number(to);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "unknown age";
  const seconds = Math.max(0, Math.round((end - start) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const CSS = `
  :root {
    color-scheme: light;
    --paper: #f4f0e6;
    --paper-raised: #eee9dc;
    --paper-deep: #e8e2d2;
    --ink: #17150f;
    --secondary: #4f4a3f;
    --muted: #6b6557;
    --rule: #d3ccba;
    --rule-strong: #a89f8c;
    --accent: #a83a1e;
    --accent-deep: #8f2f18;
    --accent-soft: #f0ded2;
    --ink-band: #1b1913;
    --on-ink: #f4f0e6;
    --on-ink-secondary: #c9c2b2;
    --on-ink-muted: #a8a294;
    --on-ink-accent: #e07a55;
    --serif: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Times New Roman", serif;
    --sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
    /* Legacy token aliases used by inline styles in older page markup. */
    --amber: var(--accent);
    --card: transparent;
    --raised: var(--paper-raised);
    --hairline: var(--rule);
    --hairline-strong: var(--rule-strong);
  }
  * { box-sizing: border-box; }
  html, body { width: 100%; max-width: 100%; margin: 0; overflow-x: hidden; }
  html { scroll-behavior: smooth; }
  body { background: var(--paper); color: var(--ink); font: 16px/1.62 var(--sans); -webkit-font-smoothing: antialiased; }
  ::selection { background: var(--accent); color: var(--paper); }
  a { color: var(--ink); text-underline-offset: 4px; text-decoration-color: var(--rule-strong); transition: color 140ms ease, text-decoration-color 140ms ease; }
  a:hover { color: var(--accent); text-decoration-color: var(--accent); }
  a:focus-visible, button:focus-visible, summary:focus-visible, [tabindex]:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px; }
  .skip-link { position: fixed; z-index: 10; top: 12px; left: 12px; padding: 10px 14px; background: var(--accent); color: var(--paper); border-radius: 3px; font-weight: 600; transform: translateY(-220%); }
  .skip-link:hover, .skip-link:focus { color: var(--paper); transform: translateY(0); }
  code { max-width: 100%; color: var(--ink); font: 12.5px/1.55 var(--mono); overflow-wrap: anywhere; background: var(--paper-raised); padding: 1px 4px; border-radius: 2px; }
  pre code { background: transparent; padding: 0; }
  h1, h2, h3, p, dl, dd { margin-top: 0; }
  h1, h2, h3 { font-family: var(--serif); font-weight: 500; }
  h1 { margin-bottom: 24px; font-size: clamp(44px, 6vw, 72px); line-height: 1.02; letter-spacing: -.035em; }
  h2 { margin: 0 0 12px; font-size: clamp(28px, 3.2vw, 40px); line-height: 1.12; letter-spacing: -.025em; }
  h3 { margin: 0; font-size: 20px; line-height: 1.25; letter-spacing: -.01em; }
  .shell { width: min(100% - 48px, 1180px); margin: 0 auto; min-width: 0; }

  .topbar { display: flex; align-items: center; justify-content: space-between; gap: 24px; min-height: 76px; border-bottom: 1px solid var(--rule); }
  .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .brand-mark { position: relative; display: block; width: 24px; height: 24px; flex: 0 0 24px; }
  .brand-mark svg { display: block; }
  .wordmark { font: 500 21px/1 var(--serif); letter-spacing: -.015em; }
  .wordmark span { color: var(--accent); }
  .nav-links { display: flex; gap: 22px; list-style: none; padding: 0; margin: 0; font: 500 11px/1.4 var(--mono); letter-spacing: .09em; text-transform: uppercase; }
  .nav-links a { text-decoration: none; color: var(--secondary); }
  .nav-links a:hover { color: var(--accent); }
  .nav-links a[aria-current="page"] { color: var(--ink); text-decoration: underline; text-decoration-color: var(--accent); text-decoration-thickness: 2px; text-underline-offset: 6px; }

  .snapshot-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--rule); }
  .snapshot-note { color: var(--secondary); font: 11px/1.6 var(--mono); }
  .status { display: inline-flex; min-height: 28px; align-items: center; padding: 3px 9px; border: 1px solid var(--rule-strong); border-radius: 2px; font: 500 11px/1.4 var(--mono); letter-spacing: .07em; text-transform: uppercase; text-decoration: none; }
  .status-snapshot { border-color: var(--accent); color: var(--accent); }
  .status-live { border-color: var(--ink); color: var(--ink); }

  .hero { max-width: 980px; padding: 72px 0 0; }
  .hero-grid { max-width: 980px; padding: 72px 0 0; }
  .hero h1 { max-width: 960px; }
  .hero .h1-accent { color: var(--accent); font-style: italic; }
  .hero-intro { color: var(--secondary); max-width: 780px; font-size: 19px; line-height: 1.62; margin: 0; }
  .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
  .hero-micro { margin: 16px 0 0; color: var(--muted); font: 11px/1.5 var(--mono); letter-spacing: .04em; }
  .hero-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin: 48px 0 0; padding: 18px 0 22px; border-top: 1px solid var(--rule-strong); border-bottom: 1px solid var(--rule); }
  .hero-stat { display: flex; align-items: baseline; gap: 12px; min-width: 0; }
  .hero-stat-num { font: 500 30px/1 var(--serif); color: var(--accent); }
  .hero-stat-label { color: var(--secondary); font: 11px/1.45 var(--mono); letter-spacing: .04em; }

  .lv-head { display: flex; justify-content: space-between; align-items: end; gap: 32px; margin-bottom: 22px; }
  .lv-status { display: grid; gap: 7px; justify-items: end; text-align: right; }
  .lv-status code { color: var(--ink); }
  .lv-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid var(--rule-strong); }
  .lv-card { min-width: 0; padding: 26px 30px 26px 0; }
  .lv-card + .lv-card { border-left: 1px solid var(--rule); padding-left: 30px; }
  .lv-card-head { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 14px; align-items: start; margin-bottom: 18px; }
  .lv-card-head h3 { font-size: 20px; }
  .lv-facts { font-size: 13px; }
  .lv-facts dt { color: var(--muted); font: 11px/1.4 var(--mono); letter-spacing: .07em; text-transform: uppercase; }
  .lv-facts dd { margin: 5px 0 0; }
  .lv-facts [data-role="verdict-glyph"] { font-family: var(--mono); margin-right: 5px; color: var(--accent); }
  .lv-note { max-width: 820px; margin: 18px 0 0; }
  .detail { max-width: 860px; margin-top: 18px; padding: 16px 18px; border: 1px solid var(--rule); border-left: 2px solid var(--accent); border-radius: 3px; background: var(--paper-raised); }
  .proof-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 22px; border-top: 1px solid var(--rule-strong); border-bottom: 1px solid var(--rule); }
  .proof-item { min-width: 0; padding: 24px 24px 24px 0; border-right: 1px solid var(--rule); }
  .proof-item:last-child { border-right: 0; padding-right: 0; }
  .proof-item:not(:first-child) { padding-left: 24px; }
  .proof-num { display: block; font: 500 58px/0.92 var(--serif); margin-bottom: 12px; color: var(--accent); }
  .proof-label { color: var(--secondary); font-size: 13px; line-height: 1.55; }
  .proof-label code { font-size: 11px; }

  main { min-width: 0; padding-bottom: 88px; }
  .section { min-width: 0; padding-top: 64px; }
  .section-heading { margin-bottom: 22px; max-width: 760px; }
  .eyebrow { margin-bottom: 14px; color: var(--accent); font: 500 11px/1.4 var(--mono); letter-spacing: .14em; text-transform: uppercase; }
  .section-copy { max-width: 720px; margin: 0; color: var(--secondary); font-size: 16px; }
  .footer { padding: 30px 0 46px; border-top: 1px solid var(--rule-strong); color: var(--muted); font: 11px/1.6 var(--mono); }
  .footer-inner { display: flex; justify-content: space-between; gap: 28px; }
  .footer-links { display: flex; gap: 18px; }

  .button { min-height: 46px; display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; border: 1px solid var(--rule-strong); border-radius: 3px; background: transparent; color: var(--ink); font: 500 13px/1.2 var(--sans); text-decoration: none; cursor: pointer; transition: color 140ms ease, border-color 140ms ease, background-color 140ms ease; }
  .button:hover { border-color: var(--accent); color: var(--accent); }
  .button-primary { border-color: var(--accent); background: var(--accent); color: var(--paper); }
  .button-primary:hover { border-color: var(--accent-deep); background: var(--accent-deep); color: var(--paper); }

  .card { min-width: 0; padding: 22px; border: 1px solid var(--rule); border-radius: 3px; background: var(--paper); }
  .card-title { font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 18px; }
  .scroll { width: 100%; max-width: 100%; overflow-x: auto; border: 1px solid var(--rule); border-radius: 3px; background: var(--paper); }
  table { width: 100%; min-width: 720px; border-collapse: collapse; font-size: 12.5px; }
  caption { padding: 12px 14px; border-bottom: 1px solid var(--rule); color: var(--secondary); text-align: left; font: 11px/1.5 var(--mono); }
  th { padding: 10px 12px; border-bottom: 1px solid var(--rule-strong); color: var(--muted); font: 500 11px/1.4 var(--mono); letter-spacing: .09em; text-transform: uppercase; text-align: left; white-space: nowrap; }
  td { padding: 10px 12px; border-bottom: 1px solid var(--rule); vertical-align: top; }
  tbody tr:last-child td { border-bottom: 0; }
  tbody tr:hover { background: var(--paper-raised); }
  .muted { color: var(--muted); font-size: 12px; }
  .secondary { color: var(--secondary); }
  .kv { display: flex; justify-content: space-between; gap: 16px; min-width: 0; padding-top: 8px; color: var(--secondary); font-size: 13px; }
  .kv > * { min-width: 0; }
  .kv code { color: var(--ink); text-align: right; }
  .reason { margin-top: 12px; padding: 8px 12px; border-left: 2px solid var(--rule-strong); background: var(--paper); color: var(--secondary); font-size: 12px; }
  .verdict { font: 600 11px/1.4 var(--mono); letter-spacing: .06em; }
  .verdict-fresh { color: var(--ink); }
  .verdict-withheld { color: var(--accent); }
  .mono-tag { font: 500 11px/1.5 var(--mono); letter-spacing: .09em; text-transform: uppercase; }
  .pill { display: inline-flex; align-items: center; min-height: 24px; padding: 2px 8px; border: 1px solid var(--rule); border-radius: 2px; color: var(--muted); font: 500 11px/1.4 var(--mono); letter-spacing: .05em; white-space: nowrap; }
  .pill-accent { border-color: var(--accent); color: var(--accent); }
  pre { max-width: 100%; margin: 0; padding: 18px; overflow-x: auto; background: var(--paper-raised); border: 1px solid var(--rule); border-radius: 3px; }
  pre code { display: block; white-space: pre; overflow-wrap: normal; font-size: 12.5px; line-height: 1.7; }
  .command-head { min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 4px 4px 4px 14px; border: 1px solid var(--rule); border-bottom: 0; border-radius: 3px 3px 0 0; color: var(--secondary); font: 11px/1.4 var(--mono); background: var(--paper-raised); }
  .command-card pre { border-radius: 0 0 3px 3px; border: 1px solid var(--rule); }
  .copy-button { min-height: 32px; padding: 6px 12px; border: 1px solid var(--rule-strong); border-radius: 2px; background: var(--paper); color: var(--ink); font: 500 11px/1.2 var(--mono); cursor: pointer; }
  .copy-button:hover { border-color: var(--accent); color: var(--accent); }

  details { min-width: 0; border: 1px solid var(--rule); border-radius: 3px; background: var(--paper); }
  details + details { margin-top: 14px; }
  summary { min-height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; cursor: pointer; font: 500 14px/1.3 var(--sans); }
  summary:hover { color: var(--accent); }
  summary::marker { color: var(--accent); }
  .details-content { min-width: 0; padding: 0 16px 16px; }
  .details-meta { color: var(--muted); font: 11px/1.5 var(--mono); letter-spacing: .05em; text-transform: uppercase; }

  .correction-list { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
  .correction-row { display: grid; grid-template-columns: minmax(0,1fr) 40px minmax(0,1fr); align-items: stretch; min-width: 0; }
  .record { display: grid; gap: 6px; min-width: 0; padding: 16px; border: 1px solid var(--rule); background: var(--paper); }
  .old-record { border-radius: 3px 0 0 3px; }
  .corrected-record { border-color: var(--rule-strong); border-left: 2px solid var(--accent); border-radius: 0 3px 3px 0; }
  .record-kind { color: var(--muted); font: 11px/1.4 var(--mono); letter-spacing: .08em; text-transform: uppercase; }
  .record span:not(.record-kind) { color: var(--secondary); font-size: 13px; }
  .correction-arrow { display: grid; place-items: center; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); background: var(--paper-raised); color: var(--accent); }
  .rail-stop { position: relative; min-width: 0; padding-top: 18px; color: var(--muted); font: 11px/1.4 var(--mono); text-align: center; overflow-wrap: anywhere; }
  .rail-stop::before { content: ""; position: absolute; top: 0; left: calc(50% - 4px); width: 8px; height: 8px; background: var(--rule-strong); }
  .rail-stop.gate-stop::before { background: var(--accent); }

  .example-layout { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(0, .55fr); gap: 48px; padding-top: 30px; border-top: 1px solid var(--rule-strong); }
  .side-note { align-self: start; padding-left: 24px; border-left: 2px solid var(--accent); }
  .side-note .mono-tag { color: var(--accent); margin-bottom: 12px; }
  .side-note .kv-list { font-size: 13px; }
  .side-note .kv-list dt { color: var(--muted); font: 11px/1.4 var(--mono); letter-spacing: .07em; text-transform: uppercase; }
  .side-note .kv-list dd { margin: 3px 0 14px; }

  .steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 30px; margin-top: 30px; }
  .step { min-width: 0; padding-top: 18px; border-top: 1px solid var(--rule-strong); }
  .step-no { display: block; margin-bottom: 14px; color: var(--accent); font: 500 34px/1 var(--serif); }
  .step .mono-tag { color: var(--muted); margin-bottom: 10px; }
  .step p:last-child { margin: 10px 0 0; color: var(--secondary); font-size: 14px; }

  .band { margin-top: 8px; padding: 42px; border-radius: 3px; background: var(--ink-band); color: var(--on-ink); }
  .band h2 { color: var(--on-ink); }
  .band .eyebrow { color: var(--on-ink-accent); }
  .band-head { display: flex; justify-content: space-between; align-items: end; gap: 28px; margin-bottom: 26px; }
  .band-note { margin: 0; color: var(--on-ink-secondary); font: 11px/1.5 var(--mono); letter-spacing: .04em; white-space: nowrap; }
  .band .command-head { border-color: rgba(244,240,230,.22); background: transparent; color: var(--on-ink-secondary); }
  .band .command-card pre { border-color: rgba(244,240,230,.22); background: rgba(244,240,230,.05); }
  .band code { color: var(--on-ink); background: transparent; }
  .band .copy-button { border-color: rgba(244,240,230,.3); background: transparent; color: var(--on-ink); }
  .band .copy-button:hover { border-color: var(--on-ink-accent); color: var(--on-ink-accent); }
  .band-foot { margin: 16px 0 0; color: var(--on-ink-secondary); font-size: 13px; }
  .band-foot a { color: var(--on-ink); }
  .band-foot a:hover { color: var(--on-ink-accent); }

  .use-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; margin-top: 30px; border-top: 1px solid var(--rule-strong); }
  .use-item { min-width: 0; padding: 24px 28px 8px 0; border-right: 1px solid var(--rule); }
  .use-item:last-child { border-right: 0; padding-right: 0; }
  .use-item:not(:first-child) { padding-left: 28px; }
  .use-item .mono-tag { color: var(--muted); margin-bottom: 10px; }
  .use-item p:not(.mono-tag) { margin: 10px 0 14px; color: var(--secondary); font-size: 14px; }
  .use-item a { font: 500 12px/1.4 var(--mono); letter-spacing: .04em; }
  .wallet-note { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 32px; align-items: start; margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--rule-strong); }
  .wallet-note .mono-tag { color: var(--accent); padding-top: 4px; }
  .wallet-note p:last-child { margin: 0; max-width: 760px; color: var(--secondary); font-size: 16px; }

  .cta { display: flex; justify-content: space-between; align-items: center; gap: 32px; padding: 32px 0; border-top: 1px solid var(--rule-strong); border-bottom: 1px solid var(--rule); }
  .cta h2 { margin-bottom: 8px; }
  .cta .button { flex: 0 0 auto; }

  @media (max-width: 1000px) {
    .proof-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .proof-item:nth-child(2n) { border-right: 0; padding-right: 0; }
    .proof-item:nth-child(n+3) { border-top: 1px solid var(--rule); }
    .steps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 900px) {
    .lv-grid { grid-template-columns: minmax(0, 1fr); }
    .lv-card { padding-right: 0; }
    .lv-card + .lv-card { border-left: 0; border-top: 1px solid var(--rule); padding-left: 0; padding-top: 26px; }
    .lv-head { align-items: start; flex-direction: column; }
    .lv-status { justify-items: start; text-align: left; }
    .example-layout { grid-template-columns: minmax(0, 1fr); gap: 32px; }
    .side-note { border-left: 0; border-top: 2px solid var(--accent); padding-left: 0; padding-top: 18px; }
    .use-grid { grid-template-columns: minmax(0, 1fr); }
    .use-item { padding: 22px 0; border-right: 0; border-bottom: 1px solid var(--rule); }
    .use-item:not(:first-child) { padding-left: 0; }
    .use-item:last-child { border-bottom: 0; }
    .wallet-note { grid-template-columns: minmax(0, 1fr); gap: 10px; }
    .cta { flex-direction: column; align-items: start; }
    .band-head { flex-direction: column; align-items: start; gap: 10px; }
    .band-note { white-space: normal; }
  }
  @media (max-width: 900px) {
    .shell { width: min(100% - 32px, 1180px); }
    .nav-links { gap: 14px; }
  }
  @media (max-width: 720px) {
    .hero { padding-top: 44px; }
    .hero-intro { font-size: 17px; }
    .lv-card-head { flex-direction: column; align-items: start; gap: 8px; }
    .command-card pre code { white-space: pre-wrap; overflow-wrap: anywhere; }
    .hero-stats { grid-template-columns: minmax(0, 1fr); gap: 12px; margin-top: 36px; }
    .hero-stat { gap: 10px; }
    .proof-strip { grid-template-columns: minmax(0, 1fr); }
    .proof-item, .proof-item:not(:first-child) { padding: 20px 0; border-right: 0; border-top: 1px solid var(--rule); }
    .proof-item:first-child { border-top: 0; }
    .proof-num { font-size: 48px; }
    .steps { grid-template-columns: minmax(0, 1fr); gap: 24px; }
    .band { padding: 26px 22px; }
    .correction-row { grid-template-columns: minmax(0, 1fr); }
    .old-record, .corrected-record { border-radius: 3px; }
    .correction-arrow { min-height: 28px; border: 0; }
    .checkpoint-rail { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 14px !important; }
    .topbar { align-items: start; padding: 16px 0; flex-direction: column; gap: 12px; }
    .nav-links { flex-wrap: wrap; }
    h1 { font-size: clamp(38px, 11vw, 52px); }
    .footer-inner { flex-direction: column; }
    .snapshot-bar { flex-direction: column; align-items: start; }
    .section { padding-top: 46px; }
  }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  }
`;

export function shell({ title, description, active, path, body, ogUrl }) {
  const url = ogUrl || `https://recallguard.vercel.app${path === "/index.html" ? "/" : path}`;
  const nav = [
    ["/index.html", "Overview"],
    ["/mcp.html", "MCP"],
    ["/evidence.html", "Evidence"],
    ["/docs.html", "Docs"],
    ["/blog.html", "Blog"],
  ].map(([href, label]) => {
    const current = active === href ? ' aria-current="page"' : "";
    return `<li><a href="${href}"${current}>${label}</a></li>`;
  }).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="description" content="${esc(description)}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${esc(url)}"/>
<meta property="og:image" content="https://recallguard.vercel.app/og.png"/>
<meta property="og:image:width" content="1200"/>
<meta property="og:image:height" content="630"/>
<meta property="og:image:alt" content="RecallGuard: a freshness gate for agents on Walrus Memory"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(description)}"/>
<meta name="twitter:image" content="https://recallguard.vercel.app/og.png"/>
<title>${esc(title)}</title>
<style>${CSS}</style>
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<nav class="shell topbar" aria-label="Primary navigation">
  <a class="brand" href="/index.html" aria-label="RecallGuard home">
    <span class="brand-mark" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="1.5" y="1.5" width="21" height="21" rx="3" stroke="#17150f" stroke-opacity=".55"/><circle cx="12" cy="12" r="4.6" stroke="#a83a1e" stroke-width="2"/><circle cx="12" cy="12" r="1.2" fill="#a83a1e"/></svg></span>
    <span class="wordmark">Recall<span>Guard</span></span>
  </a>
  <ul class="nav-links">${nav}<li><a href="${GITHUB_REPO}" rel="noopener">GitHub</a></li></ul>
</nav>
<main class="shell" id="main-content" tabindex="-1">
${body}
</main>
<footer class="footer"><div class="shell footer-inner"><span>RecallGuard · Walrus Memory + Tatum Sui Mainnet GraphQL · no LLM in the answer path</span><span class="footer-links"><a href="${GITHUB_REPO}" rel="noopener">Source</a><a href="/docs.html">Docs</a><a href="/evidence.html">Evidence</a><a href="${REPO_SNAPSHOT}" rel="noopener">Snapshot</a></span></div></footer>
</body></html>`;
}

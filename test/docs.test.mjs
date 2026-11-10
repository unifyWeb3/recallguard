import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(ROOT, path), "utf8");
const ALL_DOCS = ["README.md", "CLAIMS.md", "docs/blog.md", "docs/judge-60s.md", "docs/mcp.md"];

test("published docs describe the current remote and scope deployment/export claims precisely", () => {
  const combined = ALL_DOCS.map(read).join("\n");

  assert.doesNotMatch(combined, /Nothing is pushed|no remote configured/i);
  assert.doesNotMatch(combined, /byte-identical to `npm run export`/i);
  assert.match(combined, /static export|static snapshot/i);
});

test("judge quickstart leads with the recorded lifecycle and records the accepted test totals", () => {
  const judge = read("docs/judge-60s.md");
  const lifecycle = "npm run recall:checked -- --sample sui-clock-revision-lifecycle";

  assert.match(judge, /real revision proof in 60 seconds/i);
  assert.ok(judge.indexOf(lifecycle) > -1, "the lifecycle command must be present");
  assert.ok(judge.indexOf(lifecycle) < judge.indexOf("npm test"),
    "the lifecycle must precede the broader test and audit path");
  assert.match(judge, /174 tests, 172 pass, 0 fail, 2 skipped/);
});

test("README leads with the exact quickstart, architecture, and honest integration limits", () => {
  const readme = read("README.md");
  const command = "npm run recall:checked -- --sample sui-clock-revision-lifecycle";

  assert.match(readme, /## The problem/);
  assert.match(readme, /Risk without a gate/);
  assert.match(readme, /npm install --ignore-scripts/);
  assert.match(readme, new RegExp(command.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(readme, /## How it works/);
  assert.match(readme, /## Honest limits/);
  assert.match(readme, /live read-only CLI has one verified end-to-end Mainnet run/);
  assert.match(readme, /MCP: the product, not an adapter/);
  assert.match(readme, /recallguard-mcp/);
  assert.doesNotMatch(readme, /NOT DELIVERED/);
});

test("blog post preserves the recorded learning and outcome numbers", () => {
  const blog = read("docs/blog.md");

  assert.match(blog, /## What Tatum does/);
  assert.match(blog, /## The memories that changed the product/);
  assert.match(blog, /## A real revision can age before persistence/);
  assert.match(blog, /## The MCP server/);
  for (const value of ["214 changed", "16 unchanged-but-old", "4 unverified"]) {
    assert.match(blog, new RegExp(value));
  }
  assert.match(blog, /5,000[\s\S]*STALE[\s\S]*FALSE-STALE/);
  assert.match(blog, /20,000[\s\S]*FRESH[\s\S]*CONSISTENT/);
  assert.match(blog, /one verified end-to-end Mainnet run/);
});

test("docs contain no em dashes and point at the canonical hosted URL", () => {
  const combined = ALL_DOCS.map(read).join("\n");

  assert.ok(!combined.includes("\u2014"), "docs must not contain em dashes");
  assert.match(combined, /https:\/\/recallguard\.vercel\.app/);
  assert.doesNotMatch(combined, /freshness-bound-recall\.vercel\.app/);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(ROOT, path), "utf8");

test("the product MCP server, CLI entry points and site do not import signing code", () => {
  const files = [
    "src/mcp.mjs",
    "scripts/recallguard-mcp.mjs",
    "scripts/recall-checked.mjs",
    "src/recall-checked-cli.mjs",
    "scripts/export-site.mjs",
    "scripts/proof-page.mjs",
    ...readdirSync(resolve(ROOT, "scripts/site")).filter((name) => name.endsWith(".mjs")).map((name) => `scripts/site/${name}`),
  ];
  for (const file of files) {
    const body = read(file);
    assert.doesNotMatch(body, /from\s+["'][^"']*mainnet-proof\.mjs["']|import\s*\(\s*["'][^"']*mainnet-proof\.mjs["']\s*\)/, `${file} must not import the mainnet proof script`);
    assert.doesNotMatch(body, /Ed25519Keypair|fromSecretKey|signAndExecuteTransaction|@mysten\/sui\/transactions|@mysten\/sui\/keypairs/, `${file} must not contain signing code`);
  }
});

test("the mainnet proof script is the only file that loads disposable key material", () => {
  const body = read("scripts/mainnet-proof.mjs");
  assert.match(body, /RECALLGUARD_MAINNET_PROOF_LIVE=1/);
  assert.match(body, /I CONFIRM MAINNET PROOF/);
  assert.match(body, /MAX_WALRUS_WRITES = 8/);
  assert.match(body, /MAX_SUI_TRANSACTIONS = 6/);
  assert.doesNotMatch(body, /console\.log\(.*secret/i);
});

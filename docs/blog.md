# Your agent made a call. Was it still true?

*Draft for the Tatum × Walrus Memory “Total Recall” hackathon · Track 02: Smart Agents for Real Life*
{VIDEO_URL} {REPO_URL} {LIVE_URL}

An ops agent recalled last week that a delegate key was authorized. The account moved overnight.
The agent woke, retrieved the memory, and reached for the payment workflow it should not touch,
because nothing in a plain vector recall knows the chain moved on.

That is the failure RecallGuard exists to catch. Every memory the agent uses is checked against
live Sui state before it can become an answer. If the chain has moved on, the answer is withheld;
the verified value is used instead. RecallGuard is a small, deterministic gate; there is no LLM
between recall and the verdict. There never will be one in the answer path.

This is what one real recorded failure looks like:

```text
recall_checked: obs-sui-clock-341742463
  Walrus blob proof   checkpoint 341742463 · version 1018797298
  Tatum verification  checkpoint 341868687 · version 1019267077, digest changed
  verdict             WITHHELD: the old memory was not used as the answer
```

Interactive: pick a recorded memory and get a live verdict:
{LIVE_URL}

## What the gate does, in four steps

1. Recall a candidate from Walrus Memory.
2. Load the freshness policy for that claim class (from Walrus, not from a hidden constant).
3. Read the latest Sui checkpoint and the subject's version/digest through Tatum Sui Mainnet GraphQL: at most two reads per answer, one of them cached for a second.
4. Return the memory only if the checkpoint window, object version/digest, and wall-clock backstop all pass. Anything else fails closed.

## The memories that changed the product

RecallGuard's tolerance is itself a memory. Two per-class policy records live in Walrus Memory and
were read back before every decision:

| Class | Recorded learning | Persisted policy memory |
|---|---|---|
| FAST: Sui Clock | 50 → 25 after 3 `MISSED-CHANGE` signals | `fc-policy-FAST-v1`, blob `19ZE9y-zWt1fuR3lryI3AZiqM-v-cloWw7_oXHGOU4o` |
| SLOW: MemWal AccountRegistry | 5,000 → 10,000 → 20,000 from `FALSE-STALE` signals | `fc-policy-SLOW-v2`, blob `Zne2mnjAy6uOtOhJ6o5QAxH963EqXQaMMtYWOPBkK_4` |

Same recorded inputs, two policies: the verdict flips on the delta alone.

| Policy used for the same evidence | Verdict |
|---|---|
| Built-in 5,000-checkpoint default | `STALE / FALSE-STALE`: delta 18,155 exceeded the window |
| 20,000 from the Walrus policy memory | `FRESH / CONSISTENT`: delta fits the learned window, pin unchanged |

This is a deterministic replay of a real recorded decision; the window is the only changed input.
It is policy evaluation, not autonomous learning.

## A real revision can age before persistence

The recorded lifecycle says `STALE → FRESH → STALE` precisely:

- the predecessor observation was stale and withheld;
- the correction evaluates fresh at its own proof time;
- the same proof evaluates stale at the first later recorded check.

The correction took 117,242 ms to persist to Walrus; the first later check (1,381 ms) already found
the subject changed. The historical later event recalled proof-equivalent observation
`zAji1w8p4REMzUF2o1V7IfgfQlpN7np7Qs8ehtNVXHg`, not the correction blob itself. The contract states
that distinction instead of implying otherwise. Both blobs, and every number in this post, are
replayable from the committed snapshot, or read directly through the official aggregator read path
(`https://aggregator.walrus-mainnet.walrus.space/v1/blobs/<BLOB_ID>`).

## The MCP server

RecallGuard is not only a CLI. It speaks MCP over stdio, so Claude Code, Codex or any compatible
agent gates its own onchain claims:

```sh
claude mcp add recallguard -- node /absolute/path/to/recallguard/scripts/recallguard-mcp.mjs
recallguard-mcp   # tools: recall_checked, explain_decision, list_revisions,
                  #          get_evidence, propose_correction, store_correction
```

Read-only by default. `store_correction` refuses to write unless `RECALLGUARD_ENABLE_WRITES=true`
**and** the per-call literal `confirm="STORE-CORRECTION"` **and** live mode is configured. Recalled
memory content is treated as untrusted data everywhere: parsed fields only, never instructions.

## What Tatum does

Tatum is the chain-truth layer for the gate: the current Sui checkpoint sequence/digest, and the
current version and digest of the subject object. Every read attaches `x-api-key` on every measured
request (21/21 in the controlled run, 7/7 in the final snapshot, 2,208/2,208 in the longer page
run); the plan header is observed; at most two reads per answer; exponential backoff on 429 and
timeouts; fail-closed on anything missing or malformed.

The installable live read-only CLI path is implemented but its end-to-end run against Mainnet with
real credentials is **unverified**; the hosted page is a labelled static snapshot, not a live
service. Everything labelled “recorded” is captured Mainnet evidence; “offline” is a deterministic
replay of that evidence; “live” requires your own credentials; and the 214/16/4 split is a modelled
counterfactual analysis of the 306 recorded decisions: not production incidents.

## Honest limits

- The live read-only installable CLI remains **UNVERIFIED end to end** against Mainnet.
- The MCP path is verified by 16 protocol-level tests and a real stdio smoke client; its live mode
  inherits the same unverified status as the CLI, and remains read-only by default.
- The observer later learned a SLOW window of 40,000 that was never persisted. The stored policy
  remains 20,000, tighter and more conservative. FAST (25) is cadence-limited below its sampling
  interval, so that learning loop is effectively frozen.
- Exact Walrus blob retention is unknown because `end_epoch` was not available through the tools
  used for this project. The committed snapshot remains reproducible offline.
- No user study has validated the proposed treasury/ops persona. The scenario on the site is
  labelled hypothetical.
- Walrus proves a blob exists; it does not prove a fact is current. That is the gate's job.
- Tatum AI Builder was not used. This project uses Tatum's Sui Mainnet GraphQL gateway only.

## Try it

```sh
git clone {REPO_URL}
cd recallguard
npm install --ignore-scripts
npm run mcp:smoke
npm run recall:checked -- --sample sui-clock-revision-lifecycle
```

{VIDEO_URL} {REPO_URL} {LIVE_URL}

---

Source paths: [`src/gate.mjs`](../src/gate.mjs), [`src/policy.mjs`](../src/policy.mjs),
[`src/tatum.mjs`](../src/tatum.mjs), [`src/store.mjs`](../src/store.mjs), [`src/mcp.mjs`](../src/mcp.mjs),
[`CLAIMS.md`](../CLAIMS.md), and the committed [proof snapshot](evidence/proof-snapshot.json).

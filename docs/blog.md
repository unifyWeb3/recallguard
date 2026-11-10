# Your agent made a call. Was it still true?

*Tatum × Walrus Memory "Total Recall" hackathon · Track 02: Smart Agents for Real Life*

**Watch the two-minute demo:** <https://youtu.be/16bsUTPpyqw>
**Repo:** <https://github.com/unifyWeb3/recallguard> · **Live site:** <https://recallguard-oxunify.vercel.app>

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

Interactive: pick a recorded memory and get a verdict on the live site: <https://recallguard-oxunify.vercel.app>

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

Sui mainnet produced 4.0 checkpoints per second when this was measured on 2026-11-10, so the
learned FAST window of 25 checkpoints is about 6 seconds and the SLOW window of 20,000 is about
83 minutes. A Tatum read of the checkpoint and the subject took 0.76 s to 4.47 s, which is 3 to
18 checkpoints, so the gate binds to a chain-native monotonic counter and publishes its error
budget rather than trusting the client clock.

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

The installable live read-only CLI has one verified end-to-end Mainnet run (2026-11-10): the
credential self-test passed 6/6, 22 memories were listed, and a Sui Clock query returned
STALE/withheld with zero writes at checkpoint 343645577. The hosted page is a labelled static
snapshot, not a live service. Everything labelled "recorded" is captured Mainnet evidence; "offline"
is a deterministic replay of that evidence; "live" requires your own credentials; and the 214 changed,
16 unchanged-but-old, 4 unverified split is a modelled counterfactual analysis of the 306 recorded
decisions: not production incidents.

## Honest limits

- The live read-only installable CLI is verified for one Mainnet run (2026-11-10). This does not
  cover the live write path, other queries, or continuous availability.
- The MCP path is verified by 16 protocol-level tests and a real stdio smoke client; its live mode
  uses the same read-only gate and remains read-only by default.
- The observer later learned a SLOW window of 40,000 that was never persisted. The stored policy
  remains 20,000, tighter and more conservative. FAST (25) is cadence-limited below its sampling
  interval, so that learning loop is effectively frozen.
- Walrus blob retention is a dated estimate, not a measurement: the 22 memories were written in
  mainnet epoch 43, which ended 2026-11-17, so they expire at the start of their end epoch,
  2026-12-01 or 2026-12-15, depending on the relayer's epoch default. The README limits section
  has the sources.
- The two recorded subjects are infrastructure objects. The delegate-key-bearing MemWalAccount
  was read live on mainnet on 2026-11-10 but has no recorded proof, so the gate is not
  demonstrated on it. The README limits section has the detail. No user study has validated the
  proposed treasury and ops persona.
- Walrus proves a blob exists; it does not prove a fact is current. That is the gate's job.
- Tatum AI Builder was not used. This project uses Tatum's Sui Mainnet GraphQL gateway only.

## Try it

```sh
git clone https://github.com/unifyWeb3/recallguard
cd recallguard
npm install --ignore-scripts
npm run mcp:smoke
npm run recall:checked -- --sample sui-clock-revision-lifecycle
```

Watch the demo: <https://youtu.be/16bsUTPpyqw>

---

Source paths: [`src/gate.mjs`](../src/gate.mjs), [`src/policy.mjs`](../src/policy.mjs),
[`src/tatum.mjs`](../src/tatum.mjs), [`src/store.mjs`](../src/store.mjs), [`src/mcp.mjs`](../src/mcp.mjs),
[`CLAIMS.md`](../CLAIMS.md), and the committed [proof snapshot](evidence/proof-snapshot.json).

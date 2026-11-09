# Stage M report: controlled live mainnet proof

GO

## Summary

RecallGuard was tested against a state change that Stage M controlled. Two disposable Sui keypairs were used. TREASURY was funded by the owner. A single 0.05 SUI transfer from TREASURY to PAYEE made both S0 balance memories stale. The gate withheld both old memories as STALE with signal MISSED-CHANGE and wrote superseding corrections. A 10 minute idle check later found a false stale for TREASURY while PAYEE stayed fresh. The disposable keys were swept to the return address and destroyed. Residual dust remained because one more transfer would cost more than the dust.

## Addresses

- TREASURY: `0xf472b52aab2534acb315b3686f6eabc616eef7565fb5575342c907a66ad08ed8`
- PAYEE: `0x3d8e24f06314f2d9c7ecf4b3631c9f99e673193f5f43afe66e6588f2b0be46ef`
- Return address: `0xa7fd99c087322f257f5bcdfa6f9202bbf143e118c50d8450de00a1585531d24e`

## Transactions

All transfers were plain SUI transfers. Each transaction was simulated before execution. Recorded gas is the simulation estimate from the proof script.

| Label | Digest | Amount | Recorded gas | Explorer |
|---|---|---:|---:|---|
| S2 treasury to payee | `ByVLF39Tbr9A1JFdo7tCjseM2ZDq2ouTKfK9SzK7PQX6` | 0.05 SUI | 2,076,000 MIST (0.002076 SUI) | <https://suiscan.xyz/mainnet/tx/ByVLF39Tbr9A1JFdo7tCjseM2ZDq2ouTKfK9SzK7PQX6> |
| S6 sweep TREASURY | `DRUahrfiNgZzz78czmN888i6NWabwRPRJhjt7HED8KXs` | 0.245912 SUI | 2,076,000 MIST (0.002076 SUI) | <https://suiscan.xyz/mainnet/tx/DRUahrfiNgZzz78czmN888i6NWabwRPRJhjt7HED8KXs> |
| S6 sweep PAYEE | `CU91SmkwKrgSGvSNaqtvua1mH3p91MqZWyQ8f6LutHZQ` | 0.047 SUI | 2,076,000 MIST (0.002076 SUI) | <https://suiscan.xyz/mainnet/tx/CU91SmkwKrgSGvSNaqtvua1mH3p91MqZWyQ8f6LutHZQ> |

Recorded gas total: 6,228,000 MIST (0.006228 SUI). No single transaction estimate exceeded 0.01 SUI. No cumulative estimate exceeded 0.05 SUI.

## Balances

- S0 at checkpoint 343317323: TREASURY 300,000,000 MIST, PAYEE 0 MIST.
- After S2: TREASURY 248,912,000 MIST, PAYEE 50,000,000 MIST.
- After sweeps: TREASURY 1,912,000 MIST, PAYEE 1,911,901 MIST.
- PAYEE had one SUI coin object after S2. TREASURY had no SUI coin objects. The funded balance sat in the address balance accumulator, so the proof used a `coin_balance` predicate instead of one coin object pin.

## Memories

Walrus writes in namespace `mainnet-proof`: 4.

| Blob | Claim | Role |
|---|---|---|
| `D4zsyf2tOQGKa5nsJpa8mR1ua5l_2wOAsaQlTGIRhH8` | `obs-mainnet-proof-treasury-343317323` | S0 |
| `5s8FQA6cf2tEN0tCzrG8EWAjc-zRhbTvirtW0mtj-Cw` | `obs-mainnet-proof-payee-343317331` | S0 |
| `id8A4WU0BfxlYIUMV2fqKHwaJboHaZdUARapCC-K7ZA` | `fc-slow-mw92se8s-8r4il2` | Correction for TREASURY |
| `Cg6eYCjAZNRnLUdDMMYOtLkikHbYXNevNdCR1YutpR4` | `fc-slow-mw92ytti-7rfa2g` | Correction for PAYEE |

Each correction carries explicit `supersedes` lineage to the S0 blob.

## Verdicts

- S1 TREASURY: FRESH, signal CONSISTENT, checkpoint delta 209, subject unchanged.
- S3 TREASURY: STALE, withheld, signal MISSED-CHANGE, version changed from 300,000,000 to 248,912,000.
- S3 PAYEE: STALE, withheld, signal MISSED-CHANGE, version changed from 0 to 50,000,000.
- S4 TREASURY: STALE, withheld, signal FALSE-STALE, checkpoint delta 5122, subject unchanged.
- S4 PAYEE: FRESH, signal CONSISTENT, checkpoint delta 3895, subject unchanged.

The learned policy did not write a policy memory. The loop needs three actionable samples. This run recorded two MISSED-CHANGE samples and one FALSE-STALE sample, so no window changed.

## What the gate did

The gate used the total SUI balance as the subject pin. A transfer changed the pin and produced a withheld answer. The correction then carried the new balance forward. After the idle period, TREASURY crossed the SLOW checkpoint window while its pin stayed fixed. The gate withheld it as false stale. PAYEE stayed inside the window and remained fresh.

## Surprises and limits

- The SUI balance was held as address balance, not as owned coin objects. A single coin object pin would have been the wrong abstraction.
- The first idle recall exposed a subject filter bug: correction claims contain the word slow, and the old filter treated class words as subject selectors. The filter now excludes class names and matches exact Sui addresses in the query.
- The first sweep used a 0.01 SUI gas budget with too little reserve, so the transaction builder refused gas selection. The sweep now uses a 0.003 SUI budget and a matching reserve.
- The recorded gas values are simulation estimates. Actual sweep gas was lower, which is why about 0.0019 SUI remained on each key.
- The public live read-only CLI remains unverified end to end. Stage M used the isolated proof script.
- Walrus retention and long term policy behavior remain unverified.

## Labels

- VERIFIED: addresses, balances, digests, checkpoints, blob ids, verdicts and key destruction.
- INFERRED: gas accounting from simulation estimates and the dust explanation.
- HYPOTHESIS: none.
- UNKNOWN: Walrus retention and long term policy behavior.

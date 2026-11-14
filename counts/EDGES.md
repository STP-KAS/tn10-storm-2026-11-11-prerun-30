> **Experimental. We are just trying this.** [Disclaimer](../DISCLAIMER.md) · Kaspa Testnet-10 only; tKAS has no value. Counts only.

# Edge checks, pre-run 30 (no-disk part)

Desk private node, kaspad 2.1.0 (testnet-10, synced, never restarted). One script, [tools/edges30.mjs](../tools/edges30.mjs). Node error strings are verbatim except ids, replaced by `<id>`. Times UTC, 14 Nov 2026.

| Time | Check | Submitted | Node's answer | Result |
|---|---|---|---|---|
| 03:11:56 | Coinbase (#1137) | one transaction with the coinbase subnetwork id, no inputs, one output | `Rejected transaction <id>: coinbase transaction <id> cannot be added to the mempool` | **met** (rejected; one shot) |
| 03:12:14 | Script mass, inside (first try) | P2SH spend of our own script, 3 inputs, fee on SDK mass 2,324 | `transaction <id> is not standard: transaction has 233400 fees which is under the required amount of 353200 for normalized transient mass 3532 (proportional to transaction byte size)` | fee too low (our pricing), not a mass edge |
| 03:12:22 | Script mass, 170 inputs (first try) | 170 inputs, fee on SDK mass 103,526 | `... has 10353600 fees which is under the required amount of 18389200 for normalized transient mass 183892 ...` | fee too low (our pricing) |
| 03:12:49 | Script mass, inside | 3 inputs, fee on 2 × SDK mass | accepted, landed | **accepted** |
| 03:12:57 | Script mass, 170 inputs | 170 inputs, SDK mass 103,526, fee on 2 × SDK mass | accepted, landed | accepted: 100,000 is not a limit on this node (our prediction was wrong) |
| 03:14:16 | Script mass, crossing (retry 1) | 840 inputs, SDK mass 509,546 | `Rejected transaction <id>: transaction transient (storage) mass of 1814984 is larger than max allowed size of 1000000` | **rejected** at the transient limit (1,000,000), before the compute limit we aimed at |
| 03:15 | Recovery | the 840 coins back to key 0, 17 transactions of 50 inputs (SDK mass 30,806 each) | all accepted, 0 left at our script | — |
| — | ZK (#953) | nothing: no receipt file on the desk or in the tic-tac-toe guest image (source files about receipts only) | — | **not met**: no artifact, build declined |
| 04:03–06:05 | IBD (#1136) | a disposable fresh v2.1.0 node on the desk, own data dir and loopback ports (retry 1) | synced from nothing in 1 h 59 min 44 s; same virtual DAA and pruning point as the main node | **met** ([IBD.md](IBD.md)) |

Script used for the pair: redeem script one 480-byte data push, DROP, TRUE (485 bytes; signature script 488 bytes, push-only); P2SH output 35 bytes. Far under `max_script_public_key_len` 10,000 and `MAX_SIGNATURE_SCRIPT_LEN` 250,000. Per input: SDK mass about 606; the node's normalized transient mass for the fee about 1,082 (170 inputs); the transient mass checked against 1,000,000 about 2,161 per input (840 inputs).

Spend: fees 3.21 tKAS in all (funding 1.97, spends 0.21, inside 0.005, recovery 1.04); the 5,065 tKAS held at our script came back to key 0. Desk node synced with DAA moving before and after every step; mempool 0 after.

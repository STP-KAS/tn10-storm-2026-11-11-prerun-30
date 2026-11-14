> **Experimental. We are just trying this.** [Disclaimer](../DISCLAIMER.md) · Kaspa Testnet-10 only.

# Plan, pre-run 30 (no-disk part), written before the first submit

From the [target plan](https://github.com/STP-KAS/tn10-target-plan/blob/main/plan/PLAN.md), pre-run 30 card. Desk private node, kaspad v2.1.0, never restarted. Script: [tools/edges30.mjs](../tools/edges30.mjs).

| Check | What we submit | Pass | Fail | Cap |
|---|---|---|---|---|
| Coinbase (#1137) | ONE transaction with the coinbase subnetwork id (no inputs, one output to our key), one shot | rejected; the node's error text kept | accepted | 0 |
| Script mass, inside | a P2SH spend of our own script (redeem script: one 480-byte data push, DROP, TRUE; 485 bytes; signature script 488 bytes) with **3 inputs**, SDK mass 2,324 | accepted | rejected | fee only |
| Script mass, crossing | the same script, **170 inputs** in one transaction, SDK mass 103,526: over the mempool's standard transaction mass of 100,000, still under the block mass limits (500,000 compute and storage, 1,000,000 transient) and far under the script limits in `params.rs` (script public key 10,000 bytes; signature script 250,000 bytes; ours are 35 and 488) | rejected; the node's error text kept | accepted | fee only |
| Script mass, recovery | the remaining P2SH coins back to key 0 in batches of 50 (SDK mass about 30,800 each) | accepted (also inside the limits) | — | fee only |
| ZK (#953) | verify an existing receipt file, if one is on disk | verify returns and the node stays up | — | 0 |
| IBD (#1136) | not run: no disposable node tonight (operator decision) | — | — | — |

Funding for the pair: 173 coins of 5 tKAS from key 0 to our own P2SH script (865 tKAS held there for minutes, returned to key 0 by the spends). The script is anyone-can-spend once the redeem script is revealed by the first spend; on TN10 that is accepted, and the coins are returned straight after.

## Prediction

- Coinbase: rejected. v2.1.0 includes #1137; we expect a message naming coinbase.
- Inside (3 inputs): accepted.
- Crossing (170 inputs): rejected by mempool standardness on mass (100,000), not by a consensus limit; the 170 inputs come back as unspent and are recovered.
- ZK: `not met`, reason `no artifact, build declined`: a search of the desk and the guest image found source files only, no receipt.

## Addendum before retry 1 of the crossing (written 03:15Z, before its submit)

What happened (03:12Z): the first inside and crossing submits were both rejected for **fee**, not mass: v2.1.0 asks the fee on the "normalized transient mass (proportional to transaction byte size)", which the SDK mass call did not return (3,532 against SDK 2,324 for 3 inputs; 183,892 against 103,526 for 170). With the fee priced on 2× the SDK mass, the inside spend (3 inputs) was **accepted** and the 170-input spend was **accepted** too (both landed). Our prediction of a 100,000 standard-mass limit was wrong: on this node that size is not a limit. The crossing did not cross anything published.

Retry 1, one change: the crossing size is set over a limit the plan actually cites, block compute mass 500,000: **840 inputs**, SDK mass about 509,000, transient about 909,000 (under 1,000,000), storage mass small (a consolidation). 840 coins of 5 tKAS are funded from key 0 first (4,200 tKAS held at our script for minutes) and recovered to key 0 in batches of 50 afterwards. Prediction: rejected, with a message naming mass. Pass as written in the card: inside accepted (done), crossing rejected with its error string kept.

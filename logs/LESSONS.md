> **Experimental. We are just trying this.** [Disclaimer](../DISCLAIMER.md) · Kaspa Testnet-10 only. Counts only.

# Lessons, pre-run 30 (no-disk part)

Target: pre-run 30's no-disk checks on our desk node (kaspad 2.1.0): coinbase rejection, the script-mass pair, ZK receipt verify. **Coinbase met. Script-mass pair met (on retry 1 of the crossing). ZK not met: no artifact, build declined. IBD not run (operator: no disposable node tonight).** Table: [counts/EDGES.md](../counts/EDGES.md).

1. **Coinbase is refused at the mempool door.** One transaction with the coinbase subnetwork id came back `coinbase transaction <id> cannot be added to the mempool`. One shot; no loop; desk node only.
2. **The fee for script-heavy transactions is priced on the transient mass, not the SDK mass.** Our first inside and 170-input spends were rejected as not standard: the node asked the fee on "normalized transient mass (proportional to transaction byte size)" — 3,532 against the SDK's 2,324 for 3 inputs, 183,892 against 103,526 for 170. Pricing on 2 × the SDK mass got both accepted. Anyone building transactions with big signature scripts on v2.1.0 needs the transient figure for the fee.
3. **100,000 mass was not a limit.** We had predicted a mempool standard limit at 100,000; a 170-input spend at SDK mass 103,526 was accepted and landed. Our prediction was wrong; the plan's own figures (block mass 500,000 compute and storage, 1,000,000 transient) were the ones to aim at.
4. **The transient limit came first.** Aiming at the 500,000 compute limit with 840 inputs (SDK mass 509,546), the node rejected on the other limit: `transaction transient (storage) mass of 1814984 is larger than max allowed size of 1000000`. For this signature-script-heavy shape the transient figure grows about 3.6 × faster than the SDK mass, so it is the binding limit, at roughly 460 inputs of this script.
5. **Nothing stuck.** All 1,013 coins we put on our script came back to key 0 (the inside and 170-input spends, then 17 recoveries of 50); the desk node stayed synced with DAA moving and peers at 8 throughout; mempool 0 at the end.
6. **ZK needs an artifact we do not have.** The tic-tac-toe guest image and the desk profile hold vprogs source about receipts, no receipt file. No build tonight, as the card says.
7. **Funding.** Before the checks: a logged split on key 0 (36 transactions, 1,404 new coins, fees 0.62 tKAS): 3,524 coins over 3 tKAS. After: 3,381 coins over 3 tKAS, 85,742 usable tKAS; spend 3.21 tKAS against the 1,000 cap.
8. **Housekeeping.** The idle pre-run 26 Mini runner was stopped before the checks (Mini's kaspad untouched). The desk's Docker data disk is 53.5 GB after pre-run 26's two guest matches; desk free space went from 368 GB (02:00Z) to 329–340 GB, still far over the floor.

> **Experimental. We are just trying this.** [Disclaimer](DISCLAIMER.md) · Counts only.

# Playbook, pre-run 30 (no-disk part)

Roles: the desk runs the one probe script against its own private node; the box writes this repo; Mini is not used.

## Disk floor (written before the checks)

Desk and Mini 100 GB free, box 20 GB. Below that, nothing starts. No compile. Nothing in this pre-run creates node data.

## Status before the first submit (UTC)

- Mini: our idle pre-run 26 runner (after RETURN) stopped at 2026-11-14T03:03Z; Mini's kaspad left running and untouched.
- Coin split on key 0 (logged, key 0's own coins, no mining-wallet move: key 0 holds far over 3× the 1,000 tKAS cap), 03:05Z: 36 transactions, 1,404 new coins, fees 0.622 tKAS. `BUDGET_CHECK` (read-only) after it: pass, 3,524 coins over 3 tKAS (line 2,500), key 0 85,316 usable tKAS.
- Desk node 03:09Z: testnet-10, synced, UTXO index, 2.1.0, DAA moved 94 in 10 s, 8 peers, mempool 0.
- Disk 03:09Z: desk 329 GB free, Mini 297 GB free, box 102 GB free; all over the floor. (Desk free space was 368 GB at 02:00Z; the Docker data disk, 53.5 GB, grew during pre-run 26's two guest matches.)
- Offline rehearsal (`edges30.mjs --dry`, nothing submitted), 03:08Z: coinbase-shaped transaction built (coinbase subnetwork id); redeem script 485 bytes, signature script 488 bytes; SDK mass 1 input 1,112, 3 inputs 2,324, 50 inputs 30,806, 150 inputs 91,406, 170 inputs 103,526, 200 inputs 121,706. The crossing size was fixed at 170 from these numbers before any submit.
- ZK receipt search before the run: the desk user profile and the tic-tac-toe guest image hold vprogs source files about receipts and proofs, no receipt file.

## After the checks

- Coinbase rejected 03:11:56Z; inside accepted 03:12:49Z; 170-input spend accepted 03:12:57Z; crossing (840 inputs) rejected 03:14:16Z at the transient limit; 17 recoveries accepted by 03:15Z, 0 coins left at our script.
- Desk node 03:15Z: synced, DAA moved 101 in 10 s, 8 peers, mempool 0. Key 0: 3,381 coins over 3 tKAS, 85,742 usable tKAS. Desk 340 GB free.
- Left idle: no runner on the desk, Mini or the bot; no guest container running.

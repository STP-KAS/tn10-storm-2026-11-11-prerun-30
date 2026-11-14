> **Experimental. We are just trying this.** [Disclaimer](../DISCLAIMER.md) · Kaspa Testnet-10 only. Counts only.

# IBD (#1136), pre-run 30

A disposable TN10 kaspad on the desk: a copy of the existing v2.1.0 binary (no compile), its own fresh data directory, its own loopback-only ports, 8 outbound peers, `--ram-scale=0.5`, no mining. The main desk node (never restarted) and Mini were not touched. Guard: [tools/ibd/ibd30.ps1](../tools/ibd/ibd30.ps1) (every 30 s, floor 150 GB, deadline 06:20Z); probe: [tools/ibd/ibdprobe.mjs](../tools/ibd/ibdprobe.mjs); final compare: [tools/ibd/cmp30.mjs](../tools/ibd/cmp30.mjs). Times UTC, 14 Nov 2026. Retry 1 (the first start panicked; see [LOCKED](../locks/LOCKED.md)).

**Result: met.** The fresh node synced from nothing in **1 h 59 min 44 s** (04:03:29 → synced at the 06:03:13 probe). At 06:04:31 it read the same virtual DAA score as the main desk node (gap 0) and the same pruning point. Stopped and its directory deleted at 06:05:20.

| Stage (from the node's own log) | Start | End | Took | Size | Rate |
|---|---|---|---|---|---|
| Pruning point proof, received and validated | 04:03:29 | 04:05:33 | 2 min | 251 proof levels | — |
| Pruning point anticone; pruning-point chain segment headers | 04:05:33 | 04:06:08 | 35 s | 3 blocks; 249,283 headers | — |
| Headers | 04:06:08 | 04:18:12 | 12 min | 1,299,910 headers | about 1,800 a second |
| UTXO set of the pruning point, received | 04:19:34 | 05:08:56 | 49 min | 337,848,503 UTXOs (chunks of 1,000) | about 114,000 a second |
| UTXO set import | 05:08:56 | 05:33:43 | 25 min | — | — |
| Block bodies | 05:33:43 | 06:00:38 | 27 min | 1,299,907 blocks | about 800 a second (1,300 early, about 700 in the storm hours) |
| Catch-up round 2 | 06:00:40 | 06:02:53 | 2 min | 70,329 headers and blocks (made while it synced) | — |
| Catch-up round 3 | 06:02:53 | 06:02:57 | 4 s | 1,380 | — |
| Synced (probe `isSynced`) | — | 06:03:13 | — | 1,371,811 blocks in the DAG | — |

| Measure | Value |
|---|---|
| Data directory at its largest | 46.2 GB (measured by the guard before delete) |
| Desk free space | 340.7 GB at start, lowest 294.5 GB, 341 GB after delete (floor 150 GB never near) |
| Disposable node memory | about 6.4 GB working set at its highest reading |
| Peers | 8 outbound throughout |
| Protocol versions | the log registered peers at protocol **11** (7 times) and at protocol **10** (4 times); one peer was dropped at the start with `wrong block version: got 1 but expected 2` |
| Warnings | 4 in all: the block-version drop above; `Error deleting consensus entry 1: ... being used by another process (os error 32)` after the headers stage (Windows; the guard deleted the whole directory afterwards) |
| Probe fields | the probe's `protocols` field read empty (`advertisedProtocolVersion` not filled by the SDK); the protocol versions come from the node's log |

Against the plan's prediction: protocol 11 negotiated and chunked sync logged, as predicted. We predicted no protocol-10 peer; protocol-10 peers were registered. We predicted no sync by the deadline; the node synced with 17 minutes to spare. Disk grew by tens of GB (46 GB), as predicted.

Most of the time went to the UTXO set: 337.8 million entries took 49 minutes to receive and 25 minutes to import, more than headers and blocks together. Our storm runs make up much of that UTXO count; we did not measure how much.

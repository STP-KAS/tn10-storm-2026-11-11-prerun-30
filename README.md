> **Experimental. We are just trying this.** [Disclaimer](DISCLAIMER.md) · Kaspa Testnet-10 only; tKAS has no value.
>
> **This is a pre-run. Pre-run 30.** It is not the Wednesday run. It is not the Tuesday run. It is not pre-run 1 to 29, and it does not edit their repos. A read does not start a runner.

# tn10-storm-2026-11-11-prerun-30

**Pre-run 30 of the Wednesday neuron: v2.1.0 edge checks on our desk node (no build), then IBD on a disposable desk node.** The neuron stays [tn10-storm-2026-11-11](https://github.com/STP-KAS/tn10-storm-2026-11-11). This repo does not edit that repo.

> **Our own testing.** This is our own Kaspa Testnet-10 testing, run on our own machines and nodes. What these pages report is what we observed in this run; it is not a claim of how TN10 or Kaspa behave in general.

| Field | Value |
|---|---|
| Target | the three no-disk checks of the [target plan](https://github.com/STP-KAS/tn10-target-plan/blob/main/plan/PLAN.md)'s pre-run 30 card, each met, not met, or skipped with a written reason: coinbase rejection (#1137), the script-mass pair, ZK receipt verify (#953); then, after the operator reversed the stop at 04:46 Brussels, IBD (#1136) on a disposable node with a disk guard |
| The change | none to the load: no families, no lane, no guest. Single, labelled submits on the desk's private node only ([plan/PLAN.md](plan/PLAN.md)) |
| Met or not met | coinbase **met**; script-mass pair **met** (inside accepted; crossing rejected at the transient mass limit 1,000,000, on retry 1); ZK **not met** (no artifact, build declined); IBD **met** (fresh node synced in 1 h 59 min 44 s, retry 1) ([counts/EDGES.md](counts/EDGES.md), [counts/IBD.md](counts/IBD.md), [LESSONS](logs/LESSONS.md)) |
| Retry count | 1 for the crossing (fee on transient mass, then 840 inputs instead of 170); 1 for IBD (first start panicked on the fd budget with our small RPC/inbound limits; retry with defaults) |
| Core tags | 8 (broader stress of v2.1.0: coinbase rejection, script units / mass, ZK SDK) |
| Status | done (2026-11-14, checks 03:11–03:15Z; IBD 04:03–06:05Z, disposable node and its data deleted) |

**Why not 27, 28 or 29 first.** Pre-run 27 waits for a binary with the November RPC merges (none exists without compiling). Pre-run 28 needs a desk–Mini peer link and a host filter, left for the operator. The operator chose the no-disk part of 30 as tonight's fallback. Reasons are in [tn10-target-plan retry-log](https://github.com/STP-KAS/tn10-target-plan/blob/main/retry-log/README.md).

**Where this starts.** From [pre-run 26's locks/LOCKED.md](https://github.com/STP-KAS/tn10-storm-2026-11-11-prerun-26/blob/main/locks/LOCKED.md), copied here as [locks/LOCKED.md](locks/LOCKED.md), with a pre-run 30 section added at the end.

## Machines

| Machine | Role |
|---|---|
| Desk | its existing private TN10 node (v2.1.0, never restarted); the one probe script ([tools/edges30.mjs](tools/edges30.mjs)); for IBD, a disposable copy of the v2.1.0 binary in its own data dir and loopback ports, deleted after ([tools/ibd](tools/ibd)) |
| Mini | not used (its node is left as is; it is not a target for any check) |
| Box | coordination and this repo |

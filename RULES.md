> **Experimental. We are just trying this.** [Disclaimer](DISCLAIMER.md) · Counts only.
>
> This page is the rule for pre-run 30 (no-disk part). It does not start a machine. It does not arm Wednesday.

# Rules

The headmaster rule is [tn-master docs/NEURON.md](https://github.com/STP-KAS/tn-master/blob/main/docs/NEURON.md). The target plan is [tn10-target-plan](https://github.com/STP-KAS/tn10-target-plan); its section P (REVIEW-01) is binding here.

The arm: at 04:02 Brussels time on 14 Nov 2026 TN10 ops decided that pre-run 28 is left for the operator (no desk firewall change, no peer ban tonight) and asked for the no-disk parts of pre-run 30 as the fallback, per the plan: no disposable node, nothing that grows disk; first stop our idle Mini runner (never Mini's kaspad), a logged coin split so key 0 has at least 2,500 coins over 3 tKAS, then sync, disk, rehearsal, the checks and the close-out, under the same rules, stopping by about 07:00 Brussels with everything idle.

1. Disk first. The floor (desk and Mini 100 GB free, box 20 GB) is written before the checks. Nothing in this pre-run creates node data.
2. The desk's existing private TN10 node, synced, DAA moving. Never stopped or restarted. No compile, no reboot.
3. Funding: key 0's own coins (logged split before the checks). Cap 1,000 tKAS spend.
4. Every check is a single labelled submit, or a small fixed set, to the desk's private node only. No loop. Nothing malformed or boundary-shaped goes to a public node or to Mini.
5. An offline rehearsal (`--dry`: every transaction built and measured, nothing submitted) on the final script before the first submit.

TN10 only. Never mainnet. Counts only. No key, seed, txid, covenant id, address, host, port, or IP. Error strings are kept with any id replaced by `<id>`.

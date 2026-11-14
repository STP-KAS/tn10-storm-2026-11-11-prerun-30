// edges30.mjs (pre-run 30, the no-disk edge checks). TESTNET-10 ONLY. Desk private node only (CFG.main_node_url); never a
// public node, never Mini. Private records in <run_dir>/private/edges30.jsonl (txids there only). Prints counts and the node's
// own error strings with any 64-hex id replaced by <id>; no key, address, host or port.
// Modes (one per call):
//   --check            network, sync, version, mempool size
//   --dry              builds the coinbase-shaped tx and the script-mass pair offline (dummy outpoints), prints masses; no submit
//   --coinbase         ONE submit of a transaction with the coinbase subnetwork id; expects a rejection; one shot, no loop
//   --fund N           N coins of --each tKAS (default 5) from key 0 to our own P2SH script (redeem: a 480-byte push, DROP, TRUE)
//   --spend K --label L  one transaction spending K of those P2SH coins back to key 0 (fee 100 x mass); logs accepted or the error
//   --recover          spends what is left in batches of 50 back to key 0
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { createRequire } from "node:module";
const KIT = process.env.STORM_KIT; const U = (f) => "file:///" + path.join(KIT, f).replace(/\\/g, "/");
const { CFG, P, connect, to, massOf } = await import(U("lib.mjs"));
const { keyAddress } = await import(U("covenant.mjs"));
const k = createRequire(import.meta.url)(CFG.kaspa_sdk); const NET = "testnet-10";
const arg = (n, d) => { const i = process.argv.indexOf("--" + n); return i > 0 ? process.argv[i + 1] : d; }; const has = (n) => process.argv.includes("--" + n);
const REC = P("private", "edges30.jsonl"); const RF = P("private", "edges30-redeem.hex");
const clean = (s) => String(s?.message || s).replace(/[0-9a-f]{64}/gi, "<id>").replace(/kaspatest:[a-z0-9]+/gi, "<addr>").replace(/\b\d{1,3}(\.\d{1,3}){3}(:\d+)?\b/g, "<host>").slice(0, 600);
const rec = (o) => fs.appendFileSync(REC, JSON.stringify({ ts: new Date().toISOString(), ...o }) + "\n");
const out = (o) => console.log(JSON.stringify(o));
if (!fs.existsSync(RF)) fs.writeFileSync(RF, "4de001" + Buffer.concat([Buffer.from("p30e"), crypto.randomBytes(476)]).toString("hex") + "75" + "51");
const redeem = fs.readFileSync(RF, "utf8").trim(); const rlen = redeem.length / 2;
const sigScript = (rlen <= 255 ? "4c" + rlen.toString(16).padStart(2, "0") : "4d" + Buffer.from(Uint16Array.of(rlen).buffer).toString("hex")) + redeem;
const spk = k.payToScriptHashScript(redeem); const PADDR = k.addressFromScriptPublicKey(spk, NET).toString(); const A0 = keyAddress(0);
const p2shTx = (ents, fee) => { const tot = ents.reduce((s, e) => s + BigInt(e.amount), 0n);
  const ins = ents.map((e) => ({ address: PADDR, outpoint: { transactionId: e.outpoint.transactionId, index: e.outpoint.index }, utxoEntry: { amount: BigInt(e.amount), scriptPublicKey: spk, blockDaaScore: BigInt(e.blockDaaScore ?? 0), isCoinbase: false } }));
  const t = k.createTransaction(ins, [{ address: A0, amount: tot - fee }], 0n, null, 0); for (const i of t.inputs) i.signatureScript = sigScript; return t; };
// 03:12Z fix: v2.1.0 asks the fee on the normalized transient mass (4 x byte size), which the SDK mass call does not return;
// for this shape it is 1.5-1.8 x the SDK mass, so the fee is priced on 2 x the SDK mass (100 sompi/gram).
const priced = (ents) => { const m = massOf(p2shTx(ents, 100000n)); const fee = BigInt(m) * 200n + 1000n; const t = p2shTx(ents, fee); return { t, mass: massOf(t), fee }; };
const cbTx = () => new k.Transaction({ version: 0, inputs: [], outputs: [new k.TransactionOutput(100000000n, k.payToAddressScript(A0))], lockTime: 0n, subnetworkId: "0100000000000000000000000000000000000000", gas: 0n, payload: "70333020636f696e62617365" });
if (has("dry")) {
  const dummy = (n) => Array.from({ length: n }, (_, i) => ({ amount: 500000000n, outpoint: { transactionId: crypto.randomBytes(32).toString("hex"), index: i }, blockDaaScore: 0 }));
  let cb; try { cb = cbTx(); } catch (e) { cb = null; out({ coinbase_build_error: clean(e) }); }
  out({ redeem_bytes: rlen, sig_script_bytes: sigScript.length / 2, coinbase_built: !!cb, coinbase_subnetwork: cb ? String(cb.subnetworkId) : null,
    spend_mass: Object.fromEntries([1, 3, 50, 150, 170, 180, 200].map((n) => [n, priced(dummy(n)).mass])) });
  process.exit(0);
}
const rpc = await connect(CFG.main_node_url, 3);
const si = await to(rpc.getServerInfo(), 8000); if (si.networkId !== "testnet-10" || !si.isSynced) { out({ refuse: "not tn10 or not synced" }); process.exit(2); }
if (has("check")) { const mi = await to(rpc.getInfo(), 8000); out({ net: si.networkId, synced: si.isSynced, version: si.serverVersion, mempool: Number(mi.mempoolSize) }); }
if (has("coinbase")) {
  const t = cbTx(); let res;
  try { const r = await to(rpc.submitTransaction({ transaction: t, allowOrphan: false }), 15000, "submit"); res = { accepted: true }; rec({ step: "coinbase", result: "accepted", txid: String(r?.transactionId || "") }); }
  catch (e) { res = { accepted: false, error: clean(e) }; rec({ step: "coinbase", result: "rejected", error: String(e?.message || e).slice(0, 2000) }); }
  out({ step: "coinbase", version: si.serverVersion, ...res });
}
const pcoins = async () => ((await to(rpc.getUtxosByAddresses({ addresses: [PADDR] }), 60000)).entries || []).filter((e) => !e.isCoinbase);
if (arg("fund")) {
  const N = Number(arg("fund")), EACH = BigInt(Math.round(Number(arg("each", "5")) * 1e8)), PER = Number(arg("per", "20"));
  const lines = fs.readFileSync(CFG.keys_file, "utf8").trim().split(/\r?\n/).map((s) => s.trim()).filter(Boolean); const pk0 = new k.PrivateKey(lines[0]);
  const bag = ((await to(rpc.getUtxosByAddresses({ addresses: [A0] }), 90000)).entries || []).filter((e) => !e.isCoinbase && BigInt(e.amount) >= 20_000_000_000n && BigInt(e.amount) <= 100_000_000_000n);
  let made = 0, i = 0, fees = 0n, txs = 0;
  while (made < N && i < bag.length) {
    const n = Math.min(PER, N - made); const ins = []; let acc = 0n; while (acc < EACH * BigInt(n) + 100_000_000n && i < bag.length) { ins.push(bag[i]); acc += BigInt(bag[i].amount); i++; }
    const outs = (fee) => [...Array.from({ length: n }, () => new k.PaymentOutput(new k.Address(PADDR), EACH)), new k.PaymentOutput(new k.Address(A0), acc - EACH * BigInt(n) - fee)];
    const fee = BigInt(massOf(k.createTransaction(ins, outs(1_000_000n), 0n, undefined, 1))) * 100n + 1000n;
    const tx = k.signTransaction(k.createTransaction(ins, outs(fee), 0n, undefined, 1), [pk0], true); const m = massOf(tx);
    try { const r = await to(rpc.submitTransaction({ transaction: tx, allowOrphan: false }), 15000, "submit"); rec({ step: "fund", outs: n, each_sompi: String(EACH), mass: m, fee_sompi: String(fee), txid: String(r?.transactionId || "") }); made += n; fees += fee; txs++; }
    catch (e) { out({ fund_error: clean(e), mass: m }); break; }
  }
  const end = Date.now() + 120000; let c = []; while (Date.now() < end) { c = await pcoins(); if (c.length >= made) break; await new Promise((r) => setTimeout(r, 3000)); }
  out({ step: "fund", txs, coins_made: made, fees_tkas: Number(fees) / 1e8, p2sh_coins_seen: c.length });
}
const spendOnce = async (ents, label) => { const { t, mass, fee } = priced(ents);
  try { const r = await to(rpc.submitTransaction({ transaction: t, allowOrphan: false }), 30000, "submit"); rec({ step: "spend", label, inputs: ents.length, mass, fee_sompi: String(fee), result: "accepted_by_rpc", txid: String(r?.transactionId || "") });
    const id = String(r?.transactionId || t.id); let inPool = false; try { const me = await to(rpc.getMempoolEntry({ transactionId: id, includeOrphanPool: false, filterTransactionPool: false }), 8000); inPool = !!me?.mempoolEntry; } catch {}
    return { label, inputs: ents.length, sdk_mass: mass, fee_tkas: Number(fee) / 1e8, accepted: true, seen_in_mempool_or_landed: inPool || null }; }
  catch (e) { rec({ step: "spend", label, inputs: ents.length, mass, fee_sompi: String(fee), result: "rejected", error: String(e?.message || e).slice(0, 2000) }); return { label, inputs: ents.length, sdk_mass: mass, accepted: false, error: clean(e) }; } };
if (arg("spend")) { const K = Number(arg("spend")); const c = await pcoins(); if (c.length < K) { out({ refuse: `only ${c.length} p2sh coins` }); } else out({ step: "spend", version: si.serverVersion, ...(await spendOnce(c.slice(0, K), arg("label", "spend"))) }); }
if (has("recover")) { let c = await pcoins(); const res = []; for (let i = 0; i < c.length; i += 50) res.push(await spendOnce(c.slice(i, i + 50), "recover")); await new Promise((r) => setTimeout(r, 6000)); out({ step: "recover", batches: res.length, ok: res.filter((r) => r.accepted).length, left: (await pcoins()).length, res: res.map((r) => ({ inputs: r.inputs, accepted: r.accepted, mass: r.sdk_mass, error: r.error })) }); }
try { await rpc.disconnect(); } catch {} process.exit(0);

// ibdprobe.mjs (pre-run 30 IBD part): one read of the disposable node over its own loopback wRPC port. Prints one JSON line,
// counts only. Usage: node ibdprobe.mjs <kaspa.js path> <port>
import { createRequire } from "node:module";
const [sdk, port] = process.argv.slice(2); const k = createRequire(import.meta.url)(sdk);
const to = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);
const o = { t: new Date().toISOString() };
try { const c = new k.RpcClient({ url: `ws://127.0.0.1:${port}`, encoding: k.Encoding.Borsh, networkId: "testnet-10" }); await to(c.connect({ timeoutDuration: 5000, retryInterval: 0 }), 7000);
  const s = await to(c.getServerInfo(), 5000); o.synced = !!s.isSynced; o.net = s.networkId; o.version = s.serverVersion; o.vdaa = Number(s.virtualDaaScore);
  try { const d = await to(c.getBlockDagInfo(), 5000); o.blocks = Number(d.blockCount); o.headers = Number(d.headerCount); o.dag_vdaa = Number(d.virtualDaaScore); } catch (e) { o.dag_err = String(e.message).slice(0, 80); }
  try { const p = await to(c.getConnectedPeerInfo(), 5000); const ps = p.peerInfo || []; o.peers = ps.length; o.protocols = [...new Set(ps.map((x) => Number(x.advertisedProtocolVersion)))].sort(); o.ibd_peers = ps.filter((x) => x.isIbdPeer).length; } catch (e) { o.peer_err = String(e.message).slice(0, 80); }
  try { await c.disconnect(); } catch {} } catch (e) { o.rpc = "down: " + String(e.message).slice(0, 80); }
console.log(JSON.stringify(o)); process.exit(0);

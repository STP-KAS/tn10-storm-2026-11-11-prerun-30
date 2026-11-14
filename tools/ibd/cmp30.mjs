// cmp30.mjs (pre-run 30 IBD part): one read of two TN10 nodes (main node URL given as an argument; the disposable node on loopback). Counts only.
// Ports are written as placeholders here; the private copy on the desk holds the real ones.
// Usage: node cmp30.mjs <kaspa.js path> <host:port of the main node wRPC borsh>
import { createRequire } from "node:module"; const k=createRequire(import.meta.url)(process.argv[2]);
async function r(u){const c=new k.RpcClient({url:u,encoding:k.Encoding.Borsh,networkId:"testnet-10"});await c.connect({timeoutDuration:5000,retryInterval:0});const d=await c.getBlockDagInfo();const s=await c.getServerInfo();await c.disconnect();return {synced:s.isSynced,vdaa:Number(d.virtualDaaScore),tips:d.tipHashes.length,sink:d.sink,pp:d.pruningPointHash};}
const [a,b]=await Promise.all([r("ws://"+process.argv[3]),r("ws://127.0.0.1:<wrpc-port>")]);
console.log(JSON.stringify({t:new Date().toISOString(),main:{synced:a.synced,vdaa:a.vdaa},disposable:{synced:b.synced,vdaa:b.vdaa},vdaa_gap:a.vdaa-b.vdaa,same_pruning_point:a.pp===b.pp}));process.exit(0);

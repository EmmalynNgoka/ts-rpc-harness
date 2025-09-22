import 'dotenv/config';
import { getProvider } from './client.js';
import fs from 'node:fs';

type Summary = {
  rpc: { p95_ms: number; p99_ms: number };
  block: { avg_ms: number };
  indexer: { lag_blocks: number };
};

function percentile(arr: number[], p: number) {
  const a = [...arr].sort((x, y) => x - y);
  const idx = Math.ceil((p / 100) * a.length) - 1;
  return a[Math.max(0, Math.min(idx, a.length - 1))];
}

async function rpcLatency(runs: number) {
  const provider = getProvider();
  const samples: number[] = [];
  for (let i = 0; i < runs; i++) {
    const t0 = Date.now();
    await provider.getBlockNumber();
    samples.push(Date.now() - t0);
  }
  return { p95_ms: percentile(samples, 95), p99_ms: percentile(samples, 99) };
}

async function blockInterval(samples = 12) {
  const provider = getProvider();
  const head = await provider.getBlock('latest');
  const prev = await provider.getBlock(head!.number - 10);
  const avg = ((Number(head!.timestamp) - Number(prev!.timestamp)) / 10) * 1000;
  return { avg_ms: avg };
}

async function indexerLag() {
  const provider = getProvider();
  const chainHead = await provider.getBlockNumber();
  const indexerRpc = process.env.INDEXER_RPC;
  let indexerHead = chainHead - 1;
  if (indexerRpc) {
    const { JsonRpcProvider } = await import('ethers');
    const idx = new JsonRpcProvider(indexerRpc);
    indexerHead = await idx.getBlockNumber();
  }
  return { lag_blocks: Math.max(0, chainHead - indexerHead) };
}

async function main() {
  const runs = Number(process.argv[process.argv.indexOf('--runs') + 1] || '100');
  const outfile = process.argv[process.argv.indexOf('--outfile') + 1] || 'metrics.json';
  const [rpc, block, indexer] = await Promise.all([rpcLatency(runs), blockInterval(), indexerLag()]);
  const summary: Summary = { rpc, block, indexer };
  fs.writeFileSync(outfile, JSON.stringify(summary, null, 2));
  console.log('metrics:', summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
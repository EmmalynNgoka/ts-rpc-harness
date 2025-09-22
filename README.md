TS RPC Harness
CI
A minimal, self-contained TypeScript test harness for blockchain RPC/CLI testing.
It includes deterministic key seeding, happy-path + negative assertions, CI with a compatibility matrix, and release-gating metrics (RPC P95/P99, block time, indexer lag).
 
 Features
•	Written in TypeScript with Vitest for assertions.
•	Deterministic wallet seeding from a mnemonic.
•	Tests run against a local RPC node (Anvil or Hardhat).
•	Negative test cases (overspend, malformed RPC params).
•	Metrics script collects RPC latencies, block confirmation times, indexer lag.
•	CI workflow (GitHub Actions) with OS/Node/RPC matrix and gates.
 
  
Quickstart
# clone repo
git clone https://github.com/EmmalynNgoka/ts-rpc-harness.git
cd ts-rpc-harness

# install dependencies
npm ci

# start a local node (pick one)
anvil -p 8545 --block-time 1
# or
npx hardhat node

# copy env template
cp .env.example .env

# run tests
npm test

# collect metrics
npm run metrics -- --runs 150

# enforce gates
npm run gate
 
  Example Tests
•	 Successful ETH transfer updates balances

•	 Overspend rejected with insufficient funds

•	 Invalid params return JSON-RPC error

•	 CLI ↔ RPC parity check (nonce via eth_getTransactionCount)
 
Metrics & Gates
CI enforces: - RPC latency P95 ≤ 200 ms, P99 ≤ 300 ms - Avg block interval ≤ 1.4 s - Indexer lag ≤ 2 blocks
Metrics script writes JSON (metrics.json) and fails the build if thresholds exceeded.
 
CI Matrix
GitHub Actions runs on: - OS: ubuntu-latest - Node: 18.x, 20.x, 22.x - RPC backends: anvil, hardhat
 
Ephemeral Environments
Wallets and state are seeded automatically via src/seed.ts.
Deterministic mnemonic:
test test test test test test test test test test test junk
 
Notes
•	This repo is redaction-friendly; swap out RPC endpoints, mnemonics, or thresholds as needed.
•	In production setups, metrics feed into Prometheus/Grafana dashboards and SLO-based release gates.
 

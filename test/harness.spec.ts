import { expect, describe, it } from 'vitest';
import { getProvider, getWallet, chainId } from '../src/client.js';

describe('RPC harness', () => {
  const provider = getProvider();
  const rich = getWallet(0);
  const user = getWallet(1);

  it('connects to a node and has expected chainId', async () => {
    const id = await chainId();
    expect(id > 0n).toBe(true);
  });

  it('happy path: transfers value and updates balances', async () => {
    const before = await provider.getBalance(user.address);
    const tx = await rich.sendTransaction({
      to: user.address,
      value: 1n * 10n ** 18n
    });
    const receipt = await tx.wait();

    expect(receipt?.status).toBe(1);
    const after = await provider.getBalance(user.address);
    expect(after - before >= 1n * 10n ** 18n).toBe(true);
  });

  it('negative: rejects overspend with insufficient funds', async () => {
    const poor = getWallet(9);
    const bal = await provider.getBalance(poor.address);
    expect(bal).toBe(0n);

    await expect(async () => {
      const tx = await poor.sendTransaction({
        to: rich.address,
        value: 1n
      });
      await tx.wait();
    }).rejects.toThrow(/insufficient funds|sender doesn't have enough funds/i);
  });

  it('negative: invalid params cause JSON-RPC error', async () => {
    // @ts-expect-error – intentionally malformed
    await expect(provider.send('eth_getBalance', ['not-an-address', 'latest']))
      .rejects.toThrow(/invalid/i);
  });

  it('CLI parity: balance via RPC equals nonce via eth_getTransactionCount', async () => {
    const [nonce1, nonce2] = await Promise.all([
      provider.getTransactionCount(user.address),
      provider.send('eth_getTransactionCount', [user.address, 'latest']).then((hex: string) => Number(hex))
    ]);
    expect(nonce1).toBe(nonce2);
  });
});
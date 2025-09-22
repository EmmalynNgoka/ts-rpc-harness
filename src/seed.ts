import { getProvider, getWallet } from './client.js';

async function main() {
  const provider = getProvider();
  await provider.getBlockNumber();

  const rich = getWallet(0);
  const user = getWallet(1);

  const userBal = await provider.getBalance(user.address);
  if (userBal > 0n) {
    console.log('seed: already funded', user.address, userBal.toString());
    return;
  }

  const tx = await rich.sendTransaction({
    to: user.address,
    value: 10n * 10n ** 18n
  });
  await tx.wait();
  console.log('seed: funded', user.address);
}

main().catch((e) => {
  console.error('seed failed', e);
  process.exit(1);
});
import 'dotenv/config';
import { ethers } from 'ethers';

export function getProvider() {
  const url = process.env.RPC_URL || 'http://127.0.0.1:8545';
  return new ethers.JsonRpcProvider(url, undefined, { staticNetwork: false });
}

export function getWallet(index = 0) {
  const mnemonic = process.env.MNEMONIC!;
  if (!mnemonic) throw new Error('MNEMONIC not set');
  const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic).derivePath(`m/44'/60'/0'/0/${index}`);
  return new ethers.Wallet(wallet.privateKey, getProvider());
}

export async function chainId(): Promise<bigint> {
  const p = getProvider();
  const net = await p.getNetwork();
  return net.chainId;
}
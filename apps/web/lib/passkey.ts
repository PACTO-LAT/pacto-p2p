'use client';

import { PasskeyKit } from 'passkey-kit';

let singleton: PasskeyKit | null = null;

export function getPasskeyClient() {
  if (typeof window === 'undefined') {
    throw new Error('getPasskeyClient must be called on the client');
  }

  if (singleton) return singleton;

  const rpcUrl = process.env.NEXT_PUBLIC_rpcUrl as string | undefined;
  const networkPassphrase = process.env
    .NEXT_PUBLIC_networkPassphrase as string | undefined;
  const walletWasmHash = process.env
    .NEXT_PUBLIC_walletWasmHash as string | undefined;

  if (!rpcUrl || !networkPassphrase || !walletWasmHash) {
    throw new Error(
      'Missing Passkey env. Ensure NEXT_PUBLIC_rpcUrl, NEXT_PUBLIC_networkPassphrase, NEXT_PUBLIC_walletWasmHash are set.'
    );
  }

  singleton = new PasskeyKit({
    rpcUrl,
    networkPassphrase,
    walletWasmHash,
  });
  return singleton;
}

export function isPasskeyClientConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_rpcUrl &&
      process.env.NEXT_PUBLIC_networkPassphrase &&
      process.env.NEXT_PUBLIC_walletWasmHash
  );
}



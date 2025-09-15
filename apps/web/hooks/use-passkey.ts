'use client';

import { useMemo, useState } from 'react';
import { getPasskeyClient, isPasskeyClientConfigured } from '@/lib/passkey';

export function usePasskey() {
  const isConfigured = isPasskeyClientConfigured();
  const [busy, setBusy] = useState(false);
  const client = useMemo(() => {
    if (!isConfigured) return null;
    try {
      return getPasskeyClient();
    } catch {
      return null;
    }
  }, [isConfigured]);

  const register = async (userId: string) => {
    setBusy(true);
    try {
      if (!client) throw new Error('Passkey client not ready');
      const kit = client;
      const appName = typeof window !== 'undefined' ? window.location.hostname : 'app';
      // Client passkey creation to get WebAuthn and on-chain deployment
      const created = await kit.createWallet(appName, userId);
      // Optionally inform server to index/track
      const res = await fetch('/api/passkeys/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userInfo: { keyId: created.keyIdBase64, publicKey: undefined } }),
      });
      const serverData = res.ok ? await res.json() : {};
      return { ...created, server: serverData };
    } finally {
      setBusy(false);
    }
  };

  const authenticate = async (userId?: string) => {
    setBusy(true);
    try {
      if (!client) throw new Error('Passkey client not ready');
      const kit = client;
      const appHost = typeof window !== 'undefined' ? window.location.hostname : undefined;
      const connected = await kit.connectWallet({ rpId: appHost });
      const res = await fetch('/api/passkeys/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, keyId: connected.keyIdBase64 }),
      });
      const serverData = res.ok ? await res.json() : {};
      return { ...connected, server: serverData };
    } finally {
      setBusy(false);
    }
  };

  return {
    isConfigured,
    busy,
    client,
    register,
    authenticate,
  } as const;
}



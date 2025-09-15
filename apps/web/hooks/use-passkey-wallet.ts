'use client';

import useGlobalAuthenticationStore from '@/store/wallet.store';
import { AuthService } from '@/lib/services/auth';
import { usePasskey } from './use-passkey';

export function usePasskeyWallet() {
  const { setPasskeyConnection } = useGlobalAuthenticationStore();
  const { register, authenticate, isConfigured, busy, client } = usePasskey();

  const createPasskey = async (userId: string) => {
    const created = await register(userId);
    return created;
  };

  const connectPasskey = async (userId?: string) => {
    const connected = await authenticate(userId);
    if (connected?.contractId && connected?.keyIdBase64) {
      setPasskeyConnection({ contractId: connected.contractId, keyId: connected.keyIdBase64 });
      // Persist to user profile when available
      try {
        const authUser = await AuthService.getCurrentUser().catch(() => null);
        if (authUser) {
          await AuthService.updateUserProfile(authUser.id, {
            // @ts-expect-error: extending user with passkey fields
            passkey_contract_id: connected.contractId,
            // @ts-expect-error: extending user with passkey fields
            passkey_key_id: connected.keyIdBase64,
          });
        }
      } catch {
        // no-op persistence failure
      }
    }
    return connected;
  };

  return {
    isConfigured,
    busy,
    client,
    createPasskey,
    connectPasskey,
  } as const;
}



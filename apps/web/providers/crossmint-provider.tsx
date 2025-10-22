'use client';

import type { ReactNode } from 'react';

import {
  CrossmintAuthProvider,
  CrossmintProvider,
  CrossmintWalletProvider,
} from '@crossmint/client-sdk-react-ui';

import { CROSSMINT_CONFIG } from '@/lib/crossmint';

interface CrossmintProvidersProps {
  children: ReactNode;
}

export function CrossmintProviders({ children }: CrossmintProvidersProps) {
  return (
    <CrossmintProvider apiKey={CROSSMINT_CONFIG.apiKey || ''}>
      <CrossmintAuthProvider>
        <CrossmintWalletProvider
          createOnLogin={{
            chain: "stellar",
            signer: {
              type: "email",
            },
          }}
        >
          {children}
        </CrossmintWalletProvider>
      </CrossmintAuthProvider>
    </CrossmintProvider>
  );
}

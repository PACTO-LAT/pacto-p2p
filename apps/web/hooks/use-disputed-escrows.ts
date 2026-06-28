'use client';

import type { Escrow } from '@pacto-p2p/types';
import { useQuery } from '@tanstack/react-query';
import { useGetEscrowsFromIndexerByRole } from '@trustless-work/escrow';

/**
 * Fetches all escrows where the platform is the disputeResolver and status=disputed.
 * Uses the TrustlessWork indexer directly since escrows may not be persisted in Supabase (#102).
 */
export function useDisputedEscrows() {
  const { getEscrowsByRole } = useGetEscrowsFromIndexerByRole();
  const roleAddress = process.env.NEXT_PUBLIC_ROLE_ADDRESS;
  const apiKey = process.env.NEXT_PUBLIC_TLW_API_KEY;

  return useQuery({
    queryKey: ['admin', 'disputed-escrows'],
    queryFn: async (): Promise<Escrow[]> => {
      if (!apiKey) {
        throw new Error(
          'Trustless Work API key is missing. Please set NEXT_PUBLIC_TLW_API_KEY environment variable.'
        );
      }

      if (!roleAddress) {
        throw new Error(
          'Platform address is not configured. Set NEXT_PUBLIC_ROLE_ADDRESS environment variable.'
        );
      }

      const escrows = await getEscrowsByRole({
        role: 'disputeResolver',
        roleAddress,
        status: 'inDispute',
        type: 'single-release',
        validateOnChain: false,
      });

      if (!escrows) {
        throw new Error('Failed to fetch disputed escrows');
      }

      return escrows;
    },
    enabled: !!roleAddress && !!apiKey,
    staleTime: 1000 * 30, // 30 seconds — disputes are time-sensitive
  });
}

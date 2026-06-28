import type { Escrow } from '@pacto-p2p/types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useIndexedEscrows(enabled = true) {
  return useQuery({
    queryKey: ['indexed-escrows'],
    enabled,
    staleTime: 15_000,
    queryFn: async (): Promise<Escrow[]> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch('/api/escrows', {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });
      if (!res.ok) throw new Error('Failed to load escrows');
      const body = (await res.json()) as {
        escrows: Array<{ on_chain_snapshot: Escrow | null }>;
      };
      return body.escrows
        .map((r) => r.on_chain_snapshot)
        .filter((e): e is Escrow => e != null);
    },
  });
}

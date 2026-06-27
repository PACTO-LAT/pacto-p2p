import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useIndexedEscrows(enabled = true) {
  return useQuery({
    queryKey: ['indexed-escrows'],
    enabled,
    staleTime: 15_000,
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch('/api/escrows', {
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });
      if (!res.ok) throw new Error('Failed to load escrows');
      const body = (await res.json()) as { escrows: unknown[] };
      return body.escrows;
    },
  });
}

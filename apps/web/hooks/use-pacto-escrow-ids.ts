'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Returns a Set of engagement IDs that belong to Pacto (exist in our DB).
 * Used to filter out escrows created by other TrustlessWork apps.
 */
export function usePactoEscrowIds(engagementIds: string[]): Set<string> {
  const { data } = useQuery({
    queryKey: ['pacto-escrow-ids', engagementIds],
    queryFn: async () => {
      if (engagementIds.length === 0) return [];
      const { data } = await supabase
        .from('escrows')
        .select('engagement_id')
        .in('engagement_id', engagementIds);
      return (data ?? [])
        .map((r) => r.engagement_id)
        .filter(Boolean) as string[];
    },
    enabled: engagementIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  return new Set(data ?? []);
}

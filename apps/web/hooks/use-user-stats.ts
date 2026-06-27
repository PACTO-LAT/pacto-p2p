import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface UserStats {
  reputation_score: number;
  total_trades: number;
  total_volume: number;
}

async function fetchUserStats(): Promise<UserStats> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await fetch('/api/stats/me', {
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {},
  });
  if (!res.ok) {
    throw new Error('Failed to load user stats');
  }
  return res.json();
}

export function useUserStats(enabled = true) {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: fetchUserStats,
    enabled,
    staleTime: 30_000,
  });
}

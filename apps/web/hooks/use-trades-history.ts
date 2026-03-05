'use client';

import { useQuery } from '@tanstack/react-query';
import { TradesService } from '@/lib/services/trades';
import type { DashboardListing } from '@/lib/types';

export function useTrades(userId: string | undefined) {
  return useQuery<DashboardListing[]>({
    queryKey: ['trades', userId],
    queryFn: () => (userId ? TradesService.getUserTrades(userId) : []),
    enabled: !!userId,
  });
}

'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';

// Matches actual trades.status values written to Supabase.
// On-chain TrustlessWork states (funded, paymentReported, etc.) are not
// persisted to trades.status — those transitions happen on-chain only.
const TRADE_STATUS_MESSAGES: Record<string, string> = {
  active: 'A new trade has been initiated',
  completed: 'Trade completed successfully',
  disputed: 'A dispute has been raised on this trade',
  resolved: 'Trade dispute has been resolved',
};

export function TradeNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Channel name is unique per user to avoid collisions on re-renders
    const channel = supabase
      .channel(`trade-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `buyer_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['escrows'] });

          const newStatus = (payload.new as { status?: string })?.status;
          if (newStatus && TRADE_STATUS_MESSAGES[newStatus]) {
            sileo.info({ title: TRADE_STATUS_MESSAGES[newStatus] });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `seller_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['escrows'] });

          const newStatus = (payload.new as { status?: string })?.status;
          if (newStatus && TRADE_STATUS_MESSAGES[newStatus]) {
            sileo.info({ title: TRADE_STATUS_MESSAGES[newStatus] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return <>{children}</>;
}

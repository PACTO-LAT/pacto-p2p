'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { supabase } from '@/lib/supabase';
import useGlobalAuthenticationStore from '@/store/wallet.store';

const TRADE_STATUS_MESSAGES: Record<string, string> = {
  initialized: 'A new escrow has been created',
  funded: 'Escrow has been funded — send your payment and report it',
  paymentReported: 'Payment reported — confirm or dispute',
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
  const { address } = useGlobalAuthenticationStore();

  useEffect(() => {
    if (!address) return;

    const channel = supabase
      .channel('trade-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
          filter: `buyer_id=eq.${address}`,
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
          filter: `seller_id=eq.${address}`,
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
  }, [address, queryClient]);

  return <>{children}</>;
}

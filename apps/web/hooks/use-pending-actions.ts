'use client';

import type { Escrow } from '@pacto-p2p/types';
import { useEscrowsByRoleQuery } from './use-escrows';
import useGlobalAuthenticationStore from '@/store/wallet.store';

export function usePendingActions() {
  const { address } = useGlobalAuthenticationStore();

  const sellerParams = {
    role: 'approver' as const,
    roleAddress: address ?? '',
    isActive: true,
    enabled: !!address,
  };

  const buyerParams = {
    role: 'serviceProvider' as const,
    roleAddress: address ?? '',
    isActive: true,
    enabled: !!address,
  };

  const { data: sellerEscrows = [] } = useEscrowsByRoleQuery(sellerParams);
  const { data: buyerEscrows = [] } = useEscrowsByRoleQuery(buyerParams);

  const pendingCount = countPendingActions(sellerEscrows, buyerEscrows);

  return { pendingCount };
}

function countPendingActions(
  sellerEscrows: Escrow[],
  buyerEscrows: Escrow[]
): number {
  let count = 0;

  for (const escrow of sellerEscrows) {
    const milestone = escrow.milestones[0];
    const flags = escrow.flags;

    if (flags?.released || flags?.resolved) continue;

    // Seller needs to deposit when balance is 0
    if ((escrow.balance ?? 0) === 0) {
      count++;
      continue;
    }

    // Seller needs to confirm payment when buyer has reported
    if (milestone?.status === 'pendingApproval') {
      count++;
      continue;
    }

    // Seller needs to release funds when payment is approved
    if (milestone?.approved && (escrow.balance ?? 0) !== 0) {
      count++;
    }
  }

  for (const escrow of buyerEscrows) {
    const milestone = escrow.milestones[0];
    const flags = escrow.flags;

    if (flags?.released || flags?.resolved) continue;

    // Buyer needs to report payment when escrow is funded and not yet reported
    if (
      (escrow.balance ?? 0) > 0 &&
      milestone?.status !== 'pendingApproval' &&
      !milestone?.approved
    ) {
      count++;
    }
  }

  return count;
}

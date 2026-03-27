'use client';

import { useState } from 'react';
import { sileo } from 'sileo';
import { useInitializeTrade } from '@/hooks/use-trades';
import { useEscrowSelection } from '@/hooks/use-escrow-selection';
import type { Escrow } from '@pacto-p2p/types';
import { ReportPaymentData } from '@/lib/types/escrow';
import { TrustlineError } from '@/utils/stellar/TrustlineError';

export function useEscrowActions() {
  const [isReportPaymentLoading, setIsReportPaymentLoading] = useState(false);
  const { selectEscrow } = useEscrowSelection();
  const {
    reportPayment,
    depositFunds,
    disputeEscrow,
    releaseFunds,
    confirmPayment,
  } = useInitializeTrade();

  const handleReportPayment = async (
    escrow: Escrow,
    data: ReportPaymentData
  ) => {
    setIsReportPaymentLoading(true);
    try {
      await reportPayment(escrow, data.evidence);
      selectEscrow({
        ...escrow,
        milestones: [
          {
            ...escrow.milestones[0],
            status: 'pendingApproval',
            evidence: data.evidence,
          },
        ],
      });
      return true;
    } catch {
      sileo.error({ title: 'Error reporting payment' });
      return false;
    } finally {
      setIsReportPaymentLoading(false);
    }
  };

  const handleConfirmPayment = async (escrow: Escrow) => {
    try {
      await confirmPayment(escrow);
      selectEscrow({
        ...escrow,
        milestones: [
          {
            ...escrow.milestones[0],
            status: 'approved',
            approved: true,
          },
        ],
      });
      sileo.success({ title: 'Payment confirmed successfully' });
      return true;
    } catch (error) {
      sileo.error({
        title: 'Error confirming payment',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  };

  const handleDeposit = async (escrow: Escrow) => {
    try {
      await depositFunds(escrow);
      selectEscrow({
        ...escrow,
        balance: escrow.amount,
      });
      sileo.success({ title: 'Funds deposited successfully' });
      return true;
    } catch (error) {
      // Re-throw TrustlineError so the UI layer can show the TrustlineBanner.
      // Show a generic toast for all other errors.
      if (error instanceof TrustlineError) throw error;
      sileo.error({ title: 'Error depositing funds' });
      return false;
    }
  };

  const handleDisputeEscrow = async (escrow: Escrow) => {
    try {
      await disputeEscrow(escrow);
      selectEscrow({
        ...escrow,
        flags: {
          ...escrow.flags,
          disputed: true,
        },
      });
      sileo.success({ title: 'Escrow disputed successfully' });
      return true;
    } catch {
      sileo.error({ title: 'Error disputing escrow' });
      return false;
    }
  };

  const handleReleaseFunds = async (escrow: Escrow) => {
    try {
      await releaseFunds(escrow);
      selectEscrow({
        ...escrow,
        flags: {
          ...escrow.flags,
          released: true,
        },
        balance: 0,
      });
      sileo.success({ title: 'Funds released successfully' });
      return true;
    } catch (error) {
      // Re-throw TrustlineError so the UI layer can show the TrustlineBanner.
      if (error instanceof TrustlineError) throw error;
      sileo.error({ title: 'Error releasing funds' });
      return false;
    }
  };

  return {
    // State
    isReportPaymentLoading,

    // Actions
    handleReportPayment,
    handleConfirmPayment,
    handleDeposit,
    handleDisputeEscrow,
    handleReleaseFunds,
  };
}

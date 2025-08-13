'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useInitializeTrade } from '@/hooks/use-trades';
import { useEscrowSelection } from '@/hooks/use-escrow-selection';
import type { Escrow } from '@pacto-p2p/types';
import { ReportPaymentData } from '@/lib/types/escrow';

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

  const handleReportPayment = async (escrow: Escrow, data: ReportPaymentData) => {
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
      toast.error('Error reporting payment');
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
      toast.success('Payment confirmed successfully');
      return true;
    } catch {
      toast.error('Error confirming payment');
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
      toast.success('Funds deposited successfully');
      return true;
    } catch {
      toast.error('Error depositing funds');
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
      toast.success('Escrow disputed successfully');
      return true;
    } catch {
      toast.error('Error disputing escrow');
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
      toast.success('Funds released successfully');
      return true;
    } catch {
      toast.error('Error releasing funds');
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

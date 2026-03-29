'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { useInitializeTrade } from '@/hooks/use-trades';
import { useEscrowSelection } from '@/hooks/use-escrow-selection';
import type { Escrow } from '@pacto-p2p/types';
import { ReportPaymentData } from '@/lib/types/escrow';
import { TrustlineError } from '@/utils/stellar/TrustlineError';
import { ChatService } from '@/lib/services/chat';
import { TradesService } from '@/lib/services/trades';

export function useEscrowActions() {
  const [isReportPaymentLoading, setIsReportPaymentLoading] = useState(false);
  const [isCancelEscrowLoading, setIsCancelEscrowLoading] = useState(false);
  const queryClient = useQueryClient();
  const { selectEscrow } = useEscrowSelection();
  const {
    reportPayment,
    depositFunds,
    disputeEscrow,
    releaseFunds,
    confirmPayment,
    cancelEscrow,
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

      // System message: payment confirmed
      if (escrow.engagementId) {
        await ChatService.insertSystemMessage({
          engagementId: escrow.engagementId,
          event: 'payment_confirmed',
        });
      }

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
      const result = await releaseFunds(escrow);

      // Persist release hash + mark trade as completed in DB
      if (result?.txHash && escrow.engagementId) {
        try {
          const escrowRecord = await TradesService.getEscrowByEngagementId(escrow.engagementId);
          if (escrowRecord?.id) {
            await TradesService.updateEscrowTransactionHash(escrowRecord.id, 'release', result.txHash);
            const trade = await TradesService.getTradeByEscrowId(escrow.engagementId);
            if (trade?.id) {
              await TradesService.updateTrade(trade.id, {
                status: 'completed',
                stellar_transaction_hash: result.txHash,
                completed_at: new Date().toISOString(),
              });
            }
          }
        } catch {
          // Non-blocking: on-chain release succeeded, DB sync is best-effort
        }
      }

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

  const handleCancelEscrow = async (escrow: Escrow) => {
    setIsCancelEscrowLoading(true);
    try {
      await cancelEscrow(escrow);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['escrows'] }),
        queryClient.invalidateQueries({ queryKey: ['trades'] }),
      ]);
      selectEscrow({
        ...escrow,
        isActive: false,
      });
      sileo.success({ title: 'Trade cancelled successfully' });
      return true;
    } catch (error) {
      sileo.error({
        title: 'Error cancelling trade',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    } finally {
      setIsCancelEscrowLoading(false);
    }
  };

  return {
    // State
    isReportPaymentLoading,
    isCancelEscrowLoading,

    // Actions
    handleReportPayment,
    handleConfirmPayment,
    handleDeposit,
    handleDisputeEscrow,
    handleReleaseFunds,
    handleCancelEscrow,
  };
}

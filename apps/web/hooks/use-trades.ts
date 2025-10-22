import type { Escrow } from '@pacto-p2p/types';
import {
  type ApproveMilestonePayload,
  type ChangeMilestoneStatusPayload,
  type FundEscrowPayload,
  type InitializeSingleReleaseEscrowPayload,
  type SingleReleaseReleaseFundsPayload,
  type SingleReleaseStartDisputePayload,
  useApproveMilestone,
  useChangeMilestoneStatus,
  useFundEscrow,
  useInitializeEscrow,
  useReleaseFunds,
  useStartDispute,
} from '@trustless-work/escrow';
import type { CreateEscrowData } from '@/lib/types';
import { useCrossmint } from './use-crossmint';
import { CrossmintService } from '@/lib/services/crossmint';
import { getTrustline } from '@/utils/getTrustline';

export const useInitializeTrade = () => {
  const { deployEscrow } = useInitializeEscrow();
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { fundEscrow } = useFundEscrow();
  const { startDispute } = useStartDispute();
  const { approveMilestone } = useApproveMilestone();
  const { releaseFunds: releaseFundsEscrow } = useReleaseFunds();
  const { walletAddress: address, wallet } = useCrossmint();

  const initializeTrade = async (payload: CreateEscrowData) => {
    const trustline = getTrustline(payload.listing.token);

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_ROLE_ADDRESS) {
      throw new Error('NEXT_PUBLIC_ROLE_ADDRESS environment variable is required');
    }

    // Validate trustline
    if (!trustline?.address) {
      throw new Error('Trustline address is required');
    }

    // Get seller and buyer addresses
    const seller = payload.seller_id || address; // Use current user as seller if not specified
    const buyer = payload.buyer_id; // Buyer must be specified
    
    if (!seller) {
      throw new Error('Seller address is required');
    }
    
    if (!buyer) {
      throw new Error('Buyer address is required - cannot create escrow with same person as seller and buyer');
    }
    
    if (seller === buyer) {
      throw new Error('Seller and buyer cannot be the same person');
    }

    // Validate platform address
    const platformAddress = process.env.NEXT_PUBLIC_ROLE_ADDRESS;
    if (!platformAddress) {
      throw new Error('Platform address is required');
    }

    const finalPayload: InitializeSingleReleaseEscrowPayload = {
      signer: address || '',
      engagementId: `escrow-${Math.random().toString(36).substr(2, 9)}`,
      description: 'Payment milestone',
      trustline: {
        address: trustline?.address || '',
      },
      title: 'Escrow Transaction',
      roles: {
        approver: buyer, // Buyer requires the service
        releaseSigner: seller, // Seller releases the funds
        serviceProvider: seller, // Seller provides the service
        receiver: buyer, // Buyer receives the funds
        platformAddress: platformAddress,
        disputeResolver: platformAddress,
      },
      platformFee: (Number(process.env.NEXT_PUBLIC_PLATFORM_FEE) || 2) / 100, // Convert to decimal
      amount: payload.amount,
      milestones: [
        {
          description: 'Payment milestone',
        },
      ],
      receiverMemo: 0,
    };

    console.log('Environment variables:', {
      NEXT_PUBLIC_ROLE_ADDRESS: process.env.NEXT_PUBLIC_ROLE_ADDRESS,
      NEXT_PUBLIC_PLATFORM_FEE: process.env.NEXT_PUBLIC_PLATFORM_FEE,
    });
    console.log('Role assignments:', {
      seller,
      buyer,
      platformAddress,
      signer: address,
    });
    console.log('Platform fee calculation:', {
      envValue: process.env.NEXT_PUBLIC_PLATFORM_FEE,
      finalValue: (Number(process.env.NEXT_PUBLIC_PLATFORM_FEE) || 2) / 100,
    });
    console.log('Trustline details:', {
      address: trustline?.address,
    });
    console.log('Deploying escrow with payload:', JSON.stringify(finalPayload, null, 2));
    console.log('API Key present:', !!process.env.NEXT_PUBLIC_TLW_API_KEY);
    console.log('Environment:', process.env.NODE_ENV);
    
    let unsignedTransaction: string | undefined;
    try {
      const response = await deployEscrow(
        finalPayload,
        'single-release'
      );
      
      unsignedTransaction = response.unsignedTransaction;
      console.log('Deploy response:', response);
    } catch (error: unknown) {
      console.error('Deploy escrow error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const errorWithResponse = error as { response: { data: unknown; status: number; headers: unknown } };
        console.error('Error response:', errorWithResponse.response.data);
        console.error('Error status:', errorWithResponse.response.status);
        console.error('Error headers:', errorWithResponse.response.headers);
      }
      throw error;
    }

    if (!unsignedTransaction) {
      throw new Error(
        'Unsigned transaction is missing from deployEscrow response.'
      );
    }

    await CrossmintService.sendEscrowTransaction(wallet, unsignedTransaction, 'deploy');
  };

  const reportPayment = async (escrow: Escrow, evidence: string) => {
    const finalPayload: ChangeMilestoneStatusPayload = {
      contractId: escrow.contractId || '',
      milestoneIndex: '0',
      newStatus: 'pendingApproval',
      serviceProvider: escrow.roles.serviceProvider,
      newEvidence: evidence,
    };

    const { unsignedTransaction } = await changeMilestoneStatus(
      finalPayload,
      'single-release'
    );

    if (!unsignedTransaction) {
      throw new Error(
        'Unsigned transaction is missing from changeMilestoneStatus response.'
      );
    }

    await CrossmintService.sendEscrowTransaction(wallet, unsignedTransaction, 'changeMilestoneStatus');
  };

  const depositFunds = async (escrow: Escrow) => {
    const finalPayload: FundEscrowPayload = {
      contractId: escrow.contractId || '',
      amount: escrow.amount,
      signer: address || '',
    };

    const { unsignedTransaction } = await fundEscrow(
      finalPayload,
      'single-release'
    );

    if (!unsignedTransaction) {
      throw new Error(
        'Unsigned transaction is missing from fundEscrow response.'
      );
    }

    await CrossmintService.sendEscrowTransaction(wallet, unsignedTransaction, 'fund');
  };

  const disputeEscrow = async (escrow: Escrow) => {
    const finalPayload: SingleReleaseStartDisputePayload = {
      contractId: escrow.contractId || '',
      signer: address || '',
    };

    const { unsignedTransaction } = await startDispute(
      finalPayload,
      'single-release'
    );

    if (!unsignedTransaction) {
      throw new Error(
        'Unsigned transaction is missing from startDispute response.'
      );
    }

    await CrossmintService.sendEscrowTransaction(wallet, unsignedTransaction, 'startDispute');
  };

  const releaseFunds = async (escrow: Escrow) => {
    const finalPayload: SingleReleaseReleaseFundsPayload = {
      contractId: escrow.contractId || '',
      releaseSigner: escrow.roles.releaseSigner,
    };

    const { unsignedTransaction } = await releaseFundsEscrow(
      finalPayload,
      'single-release'
    );

    if (!unsignedTransaction) {
      throw new Error(
        'Unsigned transaction is missing from releaseFundsEscrow response.'
      );
    }

    await CrossmintService.sendEscrowTransaction(wallet, unsignedTransaction, 'releaseFunds');
  };

  const confirmPayment = async (escrow: Escrow) => {
    const finalPayload: ApproveMilestonePayload = {
      contractId: escrow.contractId || '',
      milestoneIndex: '0',
      approver: escrow.roles.approver,
    };

    const { unsignedTransaction } = await approveMilestone(
      finalPayload,
      'single-release'
    );

    if (!unsignedTransaction) {
      throw new Error(
        'Unsigned transaction is missing from approveMilestone response.'
      );
    }

    await CrossmintService.sendEscrowTransaction(wallet, unsignedTransaction, 'approveMilestone');
  };

  return {
    initializeTrade,
    reportPayment,
    confirmPayment,
    depositFunds,
    disputeEscrow,
    releaseFunds,
  };
};

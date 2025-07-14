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
  useSendTransaction,
  useStartDispute,
} from '@trustless-work/escrow';
import type { CreateEscrowData, Escrow } from '@/lib/types';
import { signTransaction } from '@/lib/wallet';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { getTrustline } from '@/utils/getTrustline';

export const useInitializeTrade = () => {
  const { deployEscrow } = useInitializeEscrow();
  const { changeMilestoneStatus } = useChangeMilestoneStatus();
  const { fundEscrow } = useFundEscrow();
  const { startDispute } = useStartDispute();
  const { approveMilestone } = useApproveMilestone();
  const { releaseFunds: releaseFundsEscrow } = useReleaseFunds();
  const { sendTransaction } = useSendTransaction();
  const { address } = useGlobalAuthenticationStore();

  const initializeTrade = async (payload: CreateEscrowData) => {
    const trustline = getTrustline(payload.listing.token);

    // todo: get seller and buyer wallet
    const seller = payload.seller_id;
    const buyer = payload.buyer_id;

    const finalPayload: InitializeSingleReleaseEscrowPayload = {
      signer: address,
      engagementId: payload.listing.token,
      description: payload.listing.description,
      trustline: {
        address: trustline?.address || '',
        decimals: trustline?.decimals || 0,
      },
      title: payload.listing.token,
      roles: {
        approver: seller, // seller
        releaseSigner: seller, // seller
        serviceProvider: buyer, // buyer
        receiver: buyer, // buyer
        platformAddress: process.env.NEXT_PUBLIC_ROLE_ADDRESS || '', // p2p
        disputeResolver: process.env.NEXT_PUBLIC_ROLE_ADDRESS || '', // p2p
      },
      platformFee: Number(process.env.NEXT_PUBLIC_PLATFORM_FEE),
      amount: payload.amount,
      milestones: [
        {
          description: payload.listing.description,
        },
      ],
      receiverMemo: 0,
    };

    const { unsignedTransaction } = await deployEscrow(
      finalPayload,
      'single-release'
    );

    if (!unsignedTransaction) {
      throw new Error(
        'Unsigned transaction is missing from deployEscrow response.'
      );
    }

    const signedTxXdr = await signTransaction({
      unsignedTransaction,
      address,
    });

    if (!signedTxXdr) {
      throw new Error('Signed transaction is missing.');
    }

    const response = await sendTransaction(signedTxXdr);

    if (response.status !== 'SUCCESS') {
      throw new Error('Transaction failed to send');
    }
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

    const signedTxXdr = await signTransaction({
      unsignedTransaction,
      address,
    });

    if (!signedTxXdr) {
      throw new Error('Signed transaction is missing.');
    }

    const response = await sendTransaction(signedTxXdr);

    if (response.status !== 'SUCCESS') {
      throw new Error('Transaction failed to send');
    }
  };

  const depositFunds = async (escrow: Escrow) => {
    const finalPayload: FundEscrowPayload = {
      contractId: escrow.contractId || '',
      amount: escrow.amount,
      signer: address,
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

    const signedTxXdr = await signTransaction({
      unsignedTransaction,
      address,
    });

    if (!signedTxXdr) {
      throw new Error('Signed transaction is missing.');
    }

    const response = await sendTransaction(signedTxXdr);

    if (response.status !== 'SUCCESS') {
      throw new Error('Transaction failed to send');
    }
  };

  const disputeEscrow = async (escrow: Escrow) => {
    const finalPayload: SingleReleaseStartDisputePayload = {
      contractId: escrow.contractId || '',
      signer: address,
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

    const signedTxXdr = await signTransaction({
      unsignedTransaction,
      address,
    });

    if (!signedTxXdr) {
      throw new Error('Signed transaction is missing.');
    }

    const response = await sendTransaction(signedTxXdr);

    if (response.status !== 'SUCCESS') {
      throw new Error('Transaction failed to send');
    }
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

    const signedTxXdr = await signTransaction({
      unsignedTransaction,
      address,
    });

    if (!signedTxXdr) {
      throw new Error('Signed transaction is missing.');
    }

    const response = await sendTransaction(signedTxXdr);

    if (response.status !== 'SUCCESS') {
      throw new Error('Transaction failed to send');
    }
  };

  const confirmPayment = async (escrow: Escrow) => {
    const finalPayload: ApproveMilestonePayload = {
      contractId: escrow.contractId || '',
      milestoneIndex: '0',
      newFlag: true,
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

    const signedTxXdr = await signTransaction({
      unsignedTransaction,
      address,
    });

    if (!signedTxXdr) {
      throw new Error('Signed transaction is missing.');
    }

    const response = await sendTransaction(signedTxXdr);

    if (response.status !== 'SUCCESS') {
      throw new Error('Transaction failed to send');
    }
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

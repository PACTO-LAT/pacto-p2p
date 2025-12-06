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
  useSendTransaction,
  useStartDispute,
} from '@trustless-work/escrow';
import type { CreateEscrowData } from '@/lib/types';
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
    if (!address) {
      throw new Error('Wallet address is required. Please connect your wallet.');
    }

    const trustline = getTrustline(payload.listing.token);
    if (!trustline || !trustline.address) {
      throw new Error(
        `Trustline not found for token: ${payload.listing.token}. Please ensure the token is supported.`
      );
    }

    const seller = payload.seller_id;
    const buyer = payload.buyer_id;

    if (!seller || !buyer) {
      throw new Error('Seller and buyer addresses are required.');
    }

    const platformAddress = process.env.NEXT_PUBLIC_ROLE_ADDRESS;
    if (!platformAddress) {
      throw new Error(
        'Platform address is not configured. Set NEXT_PUBLIC_ROLE_ADDRESS environment variable.'
      );
    }

    const platformFee = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE);
    if (Number.isNaN(platformFee) || platformFee < 0) {
      throw new Error(
        'Platform fee is not configured correctly. Set NEXT_PUBLIC_PLATFORM_FEE environment variable.'
      );
    }

    const finalPayload: InitializeSingleReleaseEscrowPayload = {
      signer: address,
      engagementId: payload.listing.token,
      description: payload.listing.description || '',
      trustline: {
        address: trustline.address,
      },
      title: payload.listing.token,
      roles: {
        approver: seller, // seller
        releaseSigner: seller, // seller
        serviceProvider: buyer, // buyer
        receiver: buyer, // buyer
        platformAddress, // p2p
        disputeResolver: platformAddress, // p2p
      },
      platformFee,
      amount: payload.amount,
      milestones: [
        {
          description: payload.listing.description || '',
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
    if (!address) {
      throw new Error('Wallet address is required. Please connect your wallet.');
    }

    if (!escrow.contractId) {
      throw new Error('Escrow contract ID is required.');
    }

    if (!escrow.roles.serviceProvider) {
      throw new Error('Service provider address is required.');
    }

    const finalPayload: ChangeMilestoneStatusPayload = {
      contractId: escrow.contractId,
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
    if (!address) {
      throw new Error('Wallet address is required. Please connect your wallet.');
    }

    if (!escrow.contractId) {
      throw new Error('Escrow contract ID is required.');
    }

    if (!escrow.amount || escrow.amount <= 0) {
      throw new Error('Invalid escrow amount.');
    }

    const finalPayload: FundEscrowPayload = {
      contractId: escrow.contractId,
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
    if (!address) {
      throw new Error('Wallet address is required. Please connect your wallet.');
    }

    if (!escrow.contractId) {
      throw new Error('Escrow contract ID is required.');
    }

    const finalPayload: SingleReleaseStartDisputePayload = {
      contractId: escrow.contractId,
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
    if (!address) {
      throw new Error('Wallet address is required. Please connect your wallet.');
    }

    if (!escrow.contractId) {
      throw new Error('Escrow contract ID is required.');
    }

    if (!escrow.roles.releaseSigner) {
      throw new Error('Release signer address is required.');
    }

    const finalPayload: SingleReleaseReleaseFundsPayload = {
      contractId: escrow.contractId,
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
    if (!address) {
      throw new Error('Wallet address is required. Please connect your wallet.');
    }

    if (!escrow.contractId) {
      throw new Error('Escrow contract ID is required.');
    }

    if (!escrow.roles.approver) {
      throw new Error('Approver address is required.');
    }

    const finalPayload: ApproveMilestonePayload = {
      contractId: escrow.contractId,
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

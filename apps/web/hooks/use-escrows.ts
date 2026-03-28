'use client';

import type { Escrow } from '@pacto-p2p/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type GetEscrowsFromIndexerByRoleParams,
  type GetEscrowsFromIndexerBySignerParams,
  useFundEscrow,
  useGetEscrowsFromIndexerByRole,
  useGetEscrowsFromIndexerBySigner,
} from '@trustless-work/escrow';
import { useRouter } from 'next/navigation';
import { sileo } from 'sileo';
import type { CreateEscrowData } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { useInitializeTrade } from './use-trades';

interface UseEscrowsByRoleQueryParams
  extends GetEscrowsFromIndexerByRoleParams {
  enabled?: boolean;
}

interface UseEscrowsBySignerQueryParams
  extends GetEscrowsFromIndexerBySignerParams {
  enabled?: boolean;
}

export const useEscrowsByRoleQuery = ({
  role,
  roleAddress,
  isActive = true,
  page,
  orderDirection,
  orderBy,
  startDate,
  endDate,
  maxAmount,
  minAmount,
  title,
  engagementId,
  status,
  type,
  enabled = true,
}: UseEscrowsByRoleQueryParams) => {
  const { getEscrowsByRole } = useGetEscrowsFromIndexerByRole();
  const apiKey = process.env.NEXT_PUBLIC_TLW_API_KEY;

  return useQuery({
    queryKey: [
      'escrows',
      roleAddress,
      role,
      isActive,
      page,
      orderDirection,
      orderBy,
      startDate,
      endDate,
      maxAmount,
      minAmount,
      title,
      engagementId,
      status,
      type,
    ],
    queryFn: async (): Promise<Escrow[]> => {
      if (!apiKey) {
        throw new Error(
          'Trustless Work API key is missing. Please set NEXT_PUBLIC_TLW_API_KEY environment variable.'
        );
      }

      try {
        const escrows = await getEscrowsByRole({
          role,
          roleAddress,
          isActive,
          page,
          orderDirection,
          orderBy,
          startDate,
          endDate,
          maxAmount,
          minAmount,
          title,
          engagementId,
          status,
          type: 'single-release',
          validateOnChain: true,
        });

        if (!escrows) {
          throw new Error('Failed to fetch escrows');
        }

        return escrows;
      } catch (error: unknown) {
        // Handle 401 Unauthorized errors
        if (
          error &&
          typeof error === 'object' &&
          'statusCode' in error &&
          error.statusCode === 401
        ) {
          throw new Error(
            'Unauthorized: Invalid or missing Trustless Work API key. Please check your NEXT_PUBLIC_TLW_API_KEY environment variable.'
          );
        }
        throw error;
      }
    },
    enabled: enabled && !!roleAddress && !!role && !!apiKey,
    staleTime: 1000 * 60 * 5,
  });
};

export const useEscrowsBySignerQuery = ({
  signer,
  isActive = true,
  page,
  orderDirection,
  orderBy,
  startDate,
  endDate,
  maxAmount,
  minAmount,
  title,
  engagementId,
  status,
  type,
  enabled = true,
}: UseEscrowsBySignerQueryParams) => {
  const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner();
  const apiKey = process.env.NEXT_PUBLIC_TLW_API_KEY;

  return useQuery({
    queryKey: [
      'escrows',
      signer,
      isActive,
      page,
      orderDirection,
      orderBy,
      startDate,
      endDate,
      maxAmount,
      minAmount,
      title,
      engagementId,
      status,
      type,
    ],
    queryFn: async () => {
      if (!apiKey) {
        throw new Error(
          'Trustless Work API key is missing. Please set NEXT_PUBLIC_TLW_API_KEY environment variable.'
        );
      }

      try {
        const escrows = await getEscrowsBySigner({
          signer,
          isActive,
          page,
          orderDirection,
          orderBy,
          startDate,
          endDate,
          maxAmount,
          minAmount,
          title,
          engagementId,
          status,
          type: 'single-release',
          validateOnChain: true,
        });

        if (!escrows) {
          throw new Error('Failed to fetch escrows');
        }

        return escrows;
      } catch (error: unknown) {
        // Handle 401 Unauthorized errors
        if (
          error &&
          typeof error === 'object' &&
          'statusCode' in error &&
          error.statusCode === 401
        ) {
          throw new Error(
            'Unauthorized: Invalid or missing Trustless Work API key. Please check your NEXT_PUBLIC_TLW_API_KEY environment variable.'
          );
        }
        throw error;
      }
    },
    enabled: enabled && !!signer && !!apiKey,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};

export function useCreateEscrow(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { initializeTrade } = useInitializeTrade();

  return useMutation({
    mutationFn: async (escrowData: CreateEscrowData) => {
      if (!escrowData.seller_id || !escrowData.buyer_id) {
        throw new Error('Seller and buyer addresses are required.');
      }

      if (!escrowData.amount || escrowData.amount <= 0) {
        throw new Error('Invalid escrow amount.');
      }

      if (!escrowData.listing.token) {
        throw new Error('Token is required.');
      }

      const { engagementId, contractId, listingId } =
        await initializeTrade(escrowData);

      // Resolve Stellar addresses to Supabase user UUIDs.
      // escrowData.buyer_id / seller_id are Stellar public keys (G...),
      // but the escrows and trades tables FK-reference users(id) which are UUIDs.
      const [{ data: buyerUser }, { data: sellerUser }] = await Promise.all([
        supabase
          .from('users')
          .select('id')
          .eq('stellar_address', escrowData.buyer_id)
          .single(),
        supabase
          .from('users')
          .select('id')
          .eq('stellar_address', escrowData.seller_id)
          .single(),
      ]);

      if (!buyerUser) {
        throw new Error('Buyer account not found. The wallet address is not registered on this platform.');
      }
      if (!sellerUser) {
        throw new Error('Seller account not found. The wallet address is not registered on this platform.');
      }

      // 1. Insert into escrows table
      const { data: escrowRow, error: escrowError } = await supabase
        .from('escrows')
        .insert({
          listing_id: listingId,
          buyer_id: buyerUser.id,
          seller_id: sellerUser.id,
          engagement_id: engagementId,
          contract_id: contractId,
          fiat_amount: escrowData.fiat_amount,
        })
        .select()
        .single();

      if (escrowError) {
        console.error('Failed to persist escrow to Supabase:', escrowError);
        throw new Error(`Failed to save escrow: ${escrowError.message}`);
      }

      // 2. Insert into trades table
      const { error: tradeError } = await supabase.from('trades').insert({
        escrow_id: escrowRow.id,
        listing_id: listingId,
        buyer_id: buyerUser.id,
        seller_id: sellerUser.id,
        token: escrowData.token || escrowData.listing.token,
        token_amount: escrowData.amount,
        fiat_amount: escrowData.fiat_amount,
        fiat_currency: escrowData.fiat_currency || escrowData.listing.fiat_currency,
        rate: escrowData.listing.rate,
        payment_method: escrowData.listing.payment_method,
        status: 'active',
      });

      if (tradeError) {
        console.error('Failed to persist trade to Supabase:', tradeError);
        throw new Error(`Failed to save trade: ${tradeError.message}`);
      }

      return { engagementId, contractId, listingId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      router.push('/dashboard/escrows');
      sileo.success({ title: 'Escrow created successfully' });
      // Call the optional callback if provided
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      sileo.error({ title: error.message || 'Failed to create escrow' });
    },
  });
}

export function useReportPayment() {
  const queryClient = useQueryClient();
  const { reportPayment } = useInitializeTrade();

  return useMutation({
    mutationFn: ({
      escrow,
      evidence,
    }: {
      escrow: Escrow;
      evidence: string;
    }) => {
      if (!escrow.contractId) {
        throw new Error('Escrow contract ID is required.');
      }

      if (!evidence || evidence.trim() === '') {
        throw new Error('Payment evidence is required.');
      }

      return reportPayment(escrow, evidence);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      sileo.success({ title: 'Payment reported successfully' });
    },
    onError: (error: Error) => {
      sileo.error({ title: error.message || 'Failed to report payment' });
    },
  });
}

export function useDepositFunds() {
  const { fundEscrow } = useFundEscrow();
  const { address } = useGlobalAuthenticationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrow }: { escrow: Escrow }) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!escrow.contractId) {
        throw new Error('Escrow contract ID is required.');
      }

      if (!escrow.amount || escrow.amount <= 0) {
        throw new Error('Invalid escrow amount.');
      }

      if (address !== escrow.roles.releaseSigner) {
        throw new Error('Only the seller can deposit funds into this escrow');
      }

      return fundEscrow(
        {
          contractId: escrow.contractId,
          amount: escrow.amount,
          signer: address,
        },
        'single-release'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      sileo.success({ title: 'Funds deposited successfully' });
    },
    onError: (error: Error) => {
      sileo.error({ title: error.message || 'Failed to deposit funds' });
    },
  });
}

export function useDisputeEscrow() {
  const { disputeEscrow } = useInitializeTrade();
  const { address } = useGlobalAuthenticationStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrow }: { escrow: Escrow }) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!escrow.contractId) {
        throw new Error('Escrow contract ID is required.');
      }

      const isParticipant =
        address === escrow.roles.releaseSigner || // = seller
        address === escrow.roles.serviceProvider; // = buyer
      if (!isParticipant) {
        throw new Error('Only escrow participants can raise a dispute');
      }

      return disputeEscrow(escrow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      sileo.success({ title: 'Escrow disputed successfully' });
    },
    onError: (error: Error) => {
      sileo.error({ title: error.message || 'Failed to dispute escrow' });
    },
  });
}

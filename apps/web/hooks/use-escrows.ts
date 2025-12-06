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
import { toast } from 'sonner';
import type { CreateEscrowData } from '@/lib/types';
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

      return initializeTrade(escrowData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      router.push('/dashboard/escrows');
      toast.success('Escrow created successfully');
      // Call the optional callback if provided
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create escrow');
    },
  });
}

export function useReportPayment() {
  const queryClient = useQueryClient();
  const { reportPayment } = useInitializeTrade();

  return useMutation({
    mutationFn: ({ escrow, evidence }: { escrow: Escrow; evidence: string }) => {
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
      toast.success('Payment reported successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to report payment');
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
        throw new Error('Wallet address is required. Please connect your wallet.');
      }

      if (!escrow.contractId) {
        throw new Error('Escrow contract ID is required.');
      }

      if (!escrow.amount || escrow.amount <= 0) {
        throw new Error('Invalid escrow amount.');
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
      toast.success('Funds deposited successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deposit funds');
    },
  });
}

export function useDisputeEscrow() {
  const { disputeEscrow } = useInitializeTrade();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ escrow }: { escrow: Escrow }) => {
      if (!escrow.contractId) {
        throw new Error('Escrow contract ID is required.');
      }

      return disputeEscrow(escrow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      toast.success('Escrow disputed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to dispute escrow');
    },
  });
}

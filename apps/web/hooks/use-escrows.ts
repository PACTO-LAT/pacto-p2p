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
import { supabase } from '@/lib/supabase';
import type { CreateEscrowData } from '@/lib/types';
import { TradesService } from '@/lib/services/trades';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { useInitializeTrade } from './use-trades';
import { TrustlineError } from '@/utils/stellar/TrustlineError';

const MAX_ACTIVE_ESCROWS_PER_BUYER_PER_LISTING = 1;

// Uses buyer UUID (not Stellar address) and queries the trades table
// so we only count non-terminal trades (active/disputed), allowing a buyer
// to re-trade with the same merchant after a previous trade completes.
async function getActiveBuyerTradeCount(
  buyerUserId: string,
  listingId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('trades')
    .select('id', { count: 'exact', head: true })
    .eq('buyer_id', buyerUserId)
    .eq('listing_id', listingId)
    .not('status', 'in', '(completed,resolved)');

  if (error) {
    throw new Error(
      `Unable to verify active trades for this listing: ${error.message}`
    );
  }

  return count ?? 0;
}

// Rate limit handling constants
const RATE_LIMIT_RETRY_DELAY = 1000; // 1 second
const RATE_LIMIT_MAX_RETRIES = 3;
const RATE_LIMIT_BACKOFF_MULTIPLIER = 2;

// Context-aware staleTime and validateOnChain defaults (issue #107)
const STALE_TIME = {
  DASHBOARD_LIST: 1000 * 60 * 5, // 5 minutes: sufficient for display
  DETAIL_PAGE: 1000 * 30, // 30 seconds: slightly fresher for detail views
  CRITICAL_FLOW: 0, // Immediate: before any financial action
} as const;

const VALIDATE_ON_CHAIN = {
  DASHBOARD_LIST: false, // Indexer data sufficient for display
  DETAIL_PAGE: true, // User is about to view details
  CRITICAL_FLOW: true, // Must have current state before action
  BACKGROUND_REFETCH: false, // Reduces load; validation on interaction
} as const;

interface UseEscrowsByRoleQueryParams
  extends GetEscrowsFromIndexerByRoleParams {
  enabled?: boolean;
  validateOnChain?: boolean;
  staleTime?: number;
  context?: 'dashboard-list' | 'detail-page' | 'critical-flow' | 'background-refetch';
}

interface UseEscrowsBySignerQueryParams
  extends GetEscrowsFromIndexerBySignerParams {
  enabled?: boolean;
  validateOnChain?: boolean;
  staleTime?: number;
  context?: 'dashboard-list' | 'detail-page' | 'critical-flow' | 'background-refetch';
}

/**
 * Exponential backoff retry handler for TrustlessWork rate limits (429)
 * Implements rate limit consideration from issue #107
 */
const handleRateLimitRetry = async (
  error: unknown,
  retryCount: number
): Promise<boolean> => {
  if (
    error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    error.statusCode === 429
  ) {
    if (retryCount < RATE_LIMIT_MAX_RETRIES) {
      const delay =
        RATE_LIMIT_RETRY_DELAY *
        Math.pow(RATE_LIMIT_BACKOFF_MULTIPLIER, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      return true; // Signal retry
    }
  }
  return false; // No retry
};

/**
 * Hook to fetch escrows by role with configurable on-chain validation
 * @param validateOnChain - Whether to verify on-chain (default: false for dashboard, true for critical flows)
 * @param staleTime - Time in ms before data is considered stale (default: 5 minutes)
 * @param context - Query context: 'dashboard-list' | 'detail-page' | 'critical-flow' | 'background-refetch'
 *
 * Context examples:
 * - 'dashboard-list': Dashboard showing list of escrows → validateOnChain: false
 * - 'detail-page': User viewing escrow details → validateOnChain: true
 * - 'critical-flow': Before deposit/confirm/release → validateOnChain: true
 * - 'background-refetch': Polling/background update → validateOnChain: false
 *
 * Issue #107: Made validateOnChain configurable to reduce rate limit risk
 */
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
  validateOnChain,
  staleTime,
  context = 'dashboard-list',
}: UseEscrowsByRoleQueryParams) => {
  const { getEscrowsByRole } = useGetEscrowsFromIndexerByRole();
  const apiKey = process.env.NEXT_PUBLIC_TLW_API_KEY;

  // Resolve validateOnChain based on context if not explicitly provided
  const resolvedValidateOnChain =
    validateOnChain !== undefined
      ? validateOnChain
      : VALIDATE_ON_CHAIN[context];

  // Resolve staleTime based on context if not explicitly provided
  const resolvedStaleTime =
    staleTime !== undefined
      ? staleTime
      : STALE_TIME[
          context === 'critical-flow'
            ? 'CRITICAL_FLOW'
            : context === 'detail-page'
              ? 'DETAIL_PAGE'
              : 'DASHBOARD_LIST'
        ];

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
      resolvedValidateOnChain,
    ],
    queryFn: async (): Promise<Escrow[]> => {
      if (!apiKey) {
        throw new Error(
          'Trustless Work API key is missing. Please set NEXT_PUBLIC_TLW_API_KEY environment variable.'
        );
      }

      let retryCount = 0;
      let lastError: unknown;

      while (retryCount <= RATE_LIMIT_MAX_RETRIES) {
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
            validateOnChain: resolvedValidateOnChain,
          });

          if (!escrows) {
            throw new Error('Failed to fetch escrows');
          }

          return escrows;
        } catch (error: unknown) {
          lastError = error;

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

          // Handle 429 Rate Limit with exponential backoff
          const shouldRetry = await handleRateLimitRetry(error, retryCount);
          if (shouldRetry) {
            retryCount++;
            continue;
          }

          // For any other error, throw immediately
          throw error;
        }
      }

      // If we exhausted retries, throw the last rate limit error
      if (
        lastError &&
        typeof lastError === 'object' &&
        'statusCode' in lastError &&
        lastError.statusCode === 429
      ) {
        throw new Error(
          `Rate limited by TrustlessWork after ${RATE_LIMIT_MAX_RETRIES} retries. Please try again in a moment.`
        );
      }

      throw lastError || new Error('Failed to fetch escrows');
    },
    enabled: enabled && !!roleAddress && !!role && !!apiKey,
    staleTime: resolvedStaleTime,
    retry: false,
  });
};

/**
 * Hook to fetch escrows by signer with configurable on-chain validation
 * @param validateOnChain - Whether to verify on-chain (default: false for dashboard, true for critical flows)
 * @param staleTime - Time in ms before data is considered stale (default: 5 minutes)
 * @param context - Query context: 'dashboard-list' | 'detail-page' | 'critical-flow' | 'background-refetch'
 *
 * Context examples:
 * - 'dashboard-list': Dashboard showing list of escrows → validateOnChain: false
 * - 'detail-page': User viewing escrow details → validateOnChain: true
 * - 'critical-flow': Before deposit/confirm/release → validateOnChain: true
 * - 'background-refetch': Polling/background update → validateOnChain: false
 *
 * Issue #107: Made validateOnChain configurable to reduce rate limit risk
 */
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
  validateOnChain,
  staleTime,
  context = 'dashboard-list',
}: UseEscrowsBySignerQueryParams) => {
  const { getEscrowsBySigner } = useGetEscrowsFromIndexerBySigner();
  const apiKey = process.env.NEXT_PUBLIC_TLW_API_KEY;

  // Resolve validateOnChain based on context if not explicitly provided
  const resolvedValidateOnChain =
    validateOnChain !== undefined
      ? validateOnChain
      : VALIDATE_ON_CHAIN[context];

  // Resolve staleTime based on context if not explicitly provided
  const resolvedStaleTime =
    staleTime !== undefined
      ? staleTime
      : STALE_TIME[
          context === 'critical-flow'
            ? 'CRITICAL_FLOW'
            : context === 'detail-page'
              ? 'DETAIL_PAGE'
              : 'DASHBOARD_LIST'
        ];

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
      resolvedValidateOnChain,
    ],
    queryFn: async () => {
      if (!apiKey) {
        throw new Error(
          'Trustless Work API key is missing. Please set NEXT_PUBLIC_TLW_API_KEY environment variable.'
        );
      }

      let retryCount = 0;
      let lastError: unknown;

      while (retryCount <= RATE_LIMIT_MAX_RETRIES) {
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
            validateOnChain: resolvedValidateOnChain,
          });

          if (!escrows) {
            throw new Error('Failed to fetch escrows');
          }

          return escrows;
        } catch (error: unknown) {
          lastError = error;

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

          // Handle 429 Rate Limit with exponential backoff
          const shouldRetry = await handleRateLimitRetry(error, retryCount);
          if (shouldRetry) {
            retryCount++;
            continue;
          }

          // For any other error, throw immediately
          throw error;
        }
      }

      // If we exhausted retries, throw the last rate limit error
      if (
        lastError &&
        typeof lastError === 'object' &&
        'statusCode' in lastError &&
        lastError.statusCode === 429
      ) {
        throw new Error(
          `Rate limited by TrustlessWork after ${RATE_LIMIT_MAX_RETRIES} retries. Please try again in a moment.`
        );
      }

      throw lastError || new Error('Failed to fetch escrows');
    },
    enabled: enabled && !!signer && !!apiKey,
    staleTime: resolvedStaleTime,
    retry: false,
  });
};

export function useCreateEscrow(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { address } = useGlobalAuthenticationStore();
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

      // Resolve Stellar addresses to Supabase user UUIDs before any DB or
      // on-chain operation — fail fast if either party is not registered.
      const [{ data: buyerUser }, { data: sellerUser }] = await Promise.all([
        supabase.from('users').select('id').eq('stellar_address', escrowData.buyer_id).single(),
        supabase.from('users').select('id').eq('stellar_address', escrowData.seller_id).single(),
      ]);

      if (!buyerUser) {
        throw new Error('Buyer account not found. The wallet address is not registered on this platform.');
      }
      if (!sellerUser) {
        throw new Error('Seller account not found. The wallet address is not registered on this platform.');
      }

      const listingId = String(
        (escrowData.listing as { id?: string | number }).id ?? ''
      );
      if (!listingId) {
        throw new Error('Listing ID is required to create an escrow.');
      }

      // Rate limit: block if buyer already has an active (non-completed) trade
      // for this listing to prevent griefing with unfunded escrows.
      const activeTradeCount = await getActiveBuyerTradeCount(buyerUser.id, listingId);
      if (activeTradeCount >= MAX_ACTIVE_ESCROWS_PER_BUYER_PER_LISTING) {
        throw new Error('You already have an active trade for this listing.');
      }

      const { txHash, engagementId, contractId } = await initializeTrade(escrowData);

      // 1. Insert into escrows table (include init tx hash if available)
      const { data: escrowRow, error: escrowError } = await supabase
        .from('escrows')
        .insert({
          listing_id: listingId,
          buyer_id: buyerUser.id,
          seller_id: sellerUser.id,
          engagement_id: engagementId,
          contract_id: contractId,
          fiat_amount: escrowData.fiat_amount,
          transaction_hashes: txHash ? { init: txHash } : {},
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
        stellar_transaction_hash: txHash ?? null,
        status: 'active',
      });

      if (tradeError) {
        console.error('Failed to persist trade to Supabase:', tradeError);
        throw new Error(`Failed to save trade: ${tradeError.message}`);
      }

      return { txHash, engagementId, contractId, listingId };
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
    mutationFn: async ({
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

      const result = await reportPayment(escrow, evidence);

      // Persist the transaction hash to the database
      if (result?.txHash && escrow.engagementId) {
        const escrowRecord = await TradesService.getEscrowByEngagementId(
          escrow.engagementId
        );
        if (escrowRecord?.id) {
          await TradesService.updateEscrowTransactionHash(
            escrowRecord.id,
            'report',
            result.txHash
          );
        }
      }

      return result;
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
  const { address } = useGlobalAuthenticationStore();
  const queryClient = useQueryClient();
  const { depositFunds } = useInitializeTrade();

  return useMutation({
    mutationFn: async ({ escrow }: { escrow: Escrow }) => {
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

      const result = await depositFunds(escrow);

      // Persist the transaction hash to the database
      if (result?.txHash && escrow.engagementId) {
        const escrowRecord = await TradesService.getEscrowByEngagementId(
          escrow.engagementId
        );
        if (escrowRecord?.id) {
          await TradesService.updateEscrowTransactionHash(
            escrowRecord.id,
            'fund',
            result.txHash
          );
        }
      }

      return result;
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
  const { address } = useGlobalAuthenticationStore();
  const queryClient = useQueryClient();
  const { disputeEscrow } = useInitializeTrade();

  return useMutation({
    mutationFn: async ({ escrow }: { escrow: Escrow }) => {
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

      const result = await disputeEscrow(escrow);

      // Persist the transaction hash to the database
      if (result?.txHash && escrow.engagementId) {
        const escrowRecord = await TradesService.getEscrowByEngagementId(
          escrow.engagementId
        );
        if (escrowRecord?.id) {
          await TradesService.updateEscrowTransactionHash(
            escrowRecord.id,
            'dispute',
            result.txHash
          );
        }
      }

      return result;
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

export function useReleaseFunds() {
  const { address } = useGlobalAuthenticationStore();
  const queryClient = useQueryClient();
  const { releaseFunds } = useInitializeTrade();

  return useMutation({
    mutationFn: async ({ escrow }: { escrow: Escrow }) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!escrow.contractId) {
        throw new Error('Escrow contract ID is required.');
      }

      if (!escrow.roles.releaseSigner) {
        throw new Error('Release signer address is required.');
      }

      const result = await releaseFunds(escrow);

      // Persist the transaction hash to the database
      if (result?.txHash && escrow.engagementId) {
        const escrowRecord = await TradesService.getEscrowByEngagementId(
          escrow.engagementId
        );
        if (escrowRecord?.id) {
          await TradesService.updateEscrowTransactionHash(
            escrowRecord.id,
            'release',
            result.txHash
          );
          // Also update the trade status to completed
          const trade = await TradesService.getTradeByEscrowId(escrow.engagementId);
          if (trade?.id) {
            await TradesService.updateTrade(trade.id, {
              status: 'completed',
              stellar_transaction_hash: result.txHash,
              completed_at: new Date().toISOString(),
            });
          }
        }
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      sileo.success({ title: 'Funds released successfully' });
    },
    onError: (error: Error) => {
      sileo.error({ title: error.message || 'Failed to release funds' });
    },
  });
}

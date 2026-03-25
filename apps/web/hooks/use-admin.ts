'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/lib/services/admin';
import { supabase } from '@/lib/supabase';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: AdminService.getPlatformStats,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useTokenOperations() {
  return useQuery({
    queryKey: ['token-operations'],
    queryFn: AdminService.getTokenOperations,
  });
}

export function useMintTokens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      amount,
      recipient,
      memo,
      createdBy,
    }: {
      token: string;
      amount: number;
      recipient: string;
      memo?: string;
      createdBy?: string;
    }) => AdminService.mintTokens(token, amount, recipient, memo, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['token-operations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}

export function useBurnTokens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      token,
      amount,
      address,
      memo,
      createdBy,
    }: {
      token: string;
      amount: number;
      address: string;
      memo?: string;
      createdBy?: string;
    }) => AdminService.burnTokens(token, amount, address, memo, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['token-operations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}

export function useMerchantApplications(status?: string) {
  return useQuery({
    queryKey: ['admin', 'merchant-applications', status],
    queryFn: async () => {
      const params = status && status !== 'all' ? `?status=${status}` : '';
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/merchants${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch merchant applications');
      return res.json();
    },
  });
}

export function useMerchantApplicationDetails(id: string) {
  return useQuery({
    queryKey: ['admin', 'merchant-application', id],
    queryFn: () => AdminService.getMerchantApplicationById(id),
    enabled: !!id,
  });
}

async function patchMerchant(id: string, action: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`/api/admin/merchants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(`Failed to ${action} merchant`);
  return res.json();
}

export function useApproveMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patchMerchant(id, 'approve'),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'merchant-applications'],
      });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}

export function useRejectMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patchMerchant(id, 'reject'),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'merchant-applications'],
      });
    },
  });
}

export function useRevokeMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patchMerchant(id, 'revoke'),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'merchant-applications'],
      });
    },
  });
}

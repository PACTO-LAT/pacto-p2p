'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/lib/services/admin';
import { supabase } from '@/lib/supabase';

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token)
    return { Authorization: `Bearer ${session.access_token}` };

  // Fallback: refresh the session in case local cache is stale
  const {
    data: { session: refreshed },
  } = await supabase.auth.refreshSession();
  if (refreshed?.access_token)
    return { Authorization: `Bearer ${refreshed.access_token}` };

  return {};
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
    mutationFn: async ({
      token,
      amount,
      recipient,
      memo,
    }: {
      token: string;
      amount: number;
      recipient: string;
      memo?: string;
    }) => {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          operation: 'mint',
          token,
          amount,
          address: recipient,
          memo,
        }),
      });
      if (!res.ok) throw new Error('Failed to mint tokens');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['token-operations'] });
      queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    },
  });
}

export function useBurnTokens() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      token,
      amount,
      address,
      memo,
    }: {
      token: string;
      amount: number;
      address: string;
      memo?: string;
    }) => {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          operation: 'burn',
          token,
          amount,
          address,
          memo,
        }),
      });
      if (!res.ok) throw new Error('Failed to burn tokens');
      return res.json();
    },
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

async function patchMerchant(id: string, action: string, reason?: string) {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`/api/admin/merchants/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ action, reason }),
  });
  if (!res.ok) throw new Error(`Failed to ${action} merchant`);
  return res.json();
}

export function useApproveMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      patchMerchant(id, 'approve', reason),
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
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      patchMerchant(id, 'reject', reason),
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
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      patchMerchant(id, 'revoke', reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'merchant-applications'],
      });
    },
  });
}

export function useAuditLogs({
  adminUserId,
  action,
  targetType,
  limit = 50,
  offset = 0,
}: {
  adminUserId?: string;
  action?: string;
  targetType?: string;
  limit?: number;
  offset?: number;
} = {}) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', { adminUserId, action, targetType, limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (adminUserId) params.set('admin_user_id', adminUserId);
      if (action) params.set('action', action);
      if (targetType) params.set('target_type', targetType);
      params.set('limit', limit.toString());
      params.set('offset', offset.toString());

      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/audit-logs?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      return res.json();
    },
  });
}
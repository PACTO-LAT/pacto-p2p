'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminService } from '@/lib/services/admin';

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
    queryFn: () => AdminService.getMerchantApplications(status),
  });
}

export function useMerchantApplicationDetails(id: string) {
  return useQuery({
    queryKey: ['admin', 'merchant-application', id],
    queryFn: () => AdminService.getMerchantApplicationById(id),
    enabled: !!id,
  });
}

export function useApproveMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminService.approveMerchant(id),
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
    mutationFn: (id: string) => AdminService.rejectMerchant(id),
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
    mutationFn: (id: string) => AdminService.revokeMerchant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'merchant-applications'],
      });
    },
  });
}

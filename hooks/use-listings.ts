'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListingsService } from '@/lib/services/listings';
import type { CreateListingData, Listing } from '@/lib/types';

export function useListings(filters?: {
  token?: string;
  type?: 'buy' | 'sell';
  status?: string;
}) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => ListingsService.getListings(filters),
  });
}

export function useUserListings(userId?: string) {
  return useQuery({
    queryKey: ['user-listings', userId],
    queryFn: () =>
      userId ? ListingsService.getUserListings(userId) : Promise.resolve([]),
    enabled: !!userId,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      listingData,
    }: {
      userId: string;
      listingData: CreateListingData;
    }) => ListingsService.createListing(userId, listingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      listingId,
      updates,
    }: {
      listingId: string;
      updates: Partial<Listing>;
    }) => ListingsService.updateListing(listingId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => ListingsService.deleteListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
    },
  });
}

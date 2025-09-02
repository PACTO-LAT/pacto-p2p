'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListingsService } from '@/lib/services/listings';
import type { CreateListingData } from '@/lib/types';
import type { DbListing } from '@/lib/types/db';
import { mapDbListingToMarketplace } from '@/lib/marketplace-utils';
import type { MarketplaceListing } from '@/lib/types/marketplace';

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

export function useMarketplaceListings(filters?: {
  token?: string;
  type?: 'buy' | 'sell';
  status?: string;
}) {
  return useQuery<MarketplaceListing[]>({
    queryKey: ['marketplace-listings', filters],
    queryFn: async () => {
      const rows = await ListingsService.getListings(filters);
      return (rows as DbListing[]).map(mapDbListingToMarketplace);
    },
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
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
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
      updates: Partial<DbListing>;
    }) => ListingsService.updateListing(listingId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-listings'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
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
      queryClient.invalidateQueries({ queryKey: ['marketplace-listings'] });
    },
  });
}

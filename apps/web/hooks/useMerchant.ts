'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { merchantAdapter } from '@/lib/adapters';
import type {
  Merchant,
  MerchantBadge,
  MerchantKpis,
  MerchantListing,
  SpeedBucket,
  VolumePoint,
} from '@/lib/types/merchant';

export function usePublicMerchant(slug: string) {
  return useQuery({
    queryKey: ['merchant', 'slug', slug],
    queryFn: () => merchantAdapter.getPublicMerchantBySlug(slug),
  });
}

export function usePublicMerchants() {
  return useQuery<Merchant[]>({
    queryKey: ['merchant', 'public-list'],
    queryFn: () => merchantAdapter.listPublicMerchants(),
  });
}

export function useMerchantBadges(id?: string) {
  return useQuery<MerchantBadge[]>({
    queryKey: ['merchant', id, 'badges'],
    queryFn: () => merchantAdapter.getBadges(id as string),
    enabled: Boolean(id),
  });
}

export function useMerchantKpis(id?: string) {
  return useQuery<MerchantKpis>({
    queryKey: ['merchant', id, 'kpis'],
    queryFn: () => merchantAdapter.getKpis(id as string),
    enabled: Boolean(id),
  });
}

export function useMerchantVolume(id?: string) {
  return useQuery<VolumePoint[]>({
    queryKey: ['merchant', id, 'volume'],
    queryFn: () => merchantAdapter.getVolumeSeries(id as string),
    enabled: Boolean(id),
  });
}

export function useMerchantSpeed(id?: string) {
  return useQuery<SpeedBucket[]>({
    queryKey: ['merchant', id, 'speed'],
    queryFn: () => merchantAdapter.getSpeedHistogram(id as string),
    enabled: Boolean(id),
  });
}

export function useMerchantListings(id?: string) {
  return useQuery<MerchantListing[]>({
    queryKey: ['merchant', id, 'listings'],
    queryFn: () => merchantAdapter.getActiveListings(id as string),
    enabled: Boolean(id),
  });
}

export function useMeMerchant() {
  return useQuery<Merchant | null>({
    queryKey: ['me', 'merchant'],
    queryFn: () => merchantAdapter.getMyMerchant(),
  });
}

export function useMyListings() {
  return useQuery<MerchantListing[]>({
    queryKey: ['me', 'listings'],
    queryFn: () => merchantAdapter.getMyListings(),
  });
}

export function useUpsertMerchantProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: merchantAdapter.upsertMyMerchantProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me', 'merchant'] });
    },
  });
}

export function useCreateMerchantListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: merchantAdapter.createMerchantListing,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me', 'listings'] });
    },
  });
}

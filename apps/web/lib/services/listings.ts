import { supabase } from '@/lib/supabase';
import type { CreateListingData } from '@/lib/types';
import type { DbListing } from '@/lib/types/db';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ListingsService {
  static async getListings(filters?: {
    token?: string;
    type?: 'buy' | 'sell';
    status?: string;
  }): Promise<DbListing[]> {
    let query = supabase
      .from('listings')
      .select(
        `
        *,
        user:users(*)
      `
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (filters?.token && filters.token !== 'all') {
      query = query.eq('token', filters.token);
    }

    if (filters?.type && filters.type !== 'buy') {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as unknown as DbListing[]) || [];
  }

  static async getUserListings(userId: string): Promise<DbListing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select(
        `
        *,
        user:users(*)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as unknown as DbListing[]) || [];
  }

  static async createListing(
    userId: string,
    listingData: CreateListingData
  ): Promise<DbListing> {
    // Resolve merchant for this user to set merchant_id
    const { data: merchant } = await supabase
      .from('merchants')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const { data, error } = await supabase
      .from('listings')
      .insert({
        ...listingData,
        user_id: userId,
        merchant_id: merchant?.id ?? null,
      })
      .select(
        `
        *,
        user:users(*)
      `
      )
      .single();

    if (error) throw error;
    return data as unknown as DbListing;
  }

  static async updateListing(
    listingId: string,
    updates: Partial<DbListing>
  ): Promise<DbListing> {
    const { data, error } = await supabase
      .from('listings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listingId)
      .select(
        `
        *,
        user:users(*)
      `
      )
      .single();

    if (error) throw error;
    return data as unknown as DbListing;
  }

  static async deleteListing(listingId: string): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) throw error;
  }

  static async getListingById(listingId: string): Promise<DbListing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select(
        `
        *,
        user:users(*)
      `
      )
      .eq('id', listingId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return (data as unknown as DbListing) ?? null;
  }
}

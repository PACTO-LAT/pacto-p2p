import { supabase } from "@/lib/supabase";
import type { CreateListingData, Listing } from "@/lib/types";

export class ListingsService {
  static async getListings(filters?: {
    token?: string;
    type?: "buy" | "sell";
    status?: string;
  }): Promise<Listing[]> {
    let query = supabase
      .from("listings")
      .select(
        `
        *,
        user:users(*)
      `
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (filters?.token && filters.token !== "all") {
      query = query.eq("token", filters.token);
    }

    if (filters?.type && filters.type !== "buy") {
      query = query.eq("type", filters.type);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  static async getUserListings(userId: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        user:users(*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createListing(
    userId: string,
    listingData: CreateListingData
  ): Promise<Listing> {
    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...listingData,
        user_id: userId,
      })
      .select(
        `
        *,
        user:users(*)
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  static async updateListing(
    listingId: string,
    updates: Partial<Listing>
  ): Promise<Listing> {
    const { data, error } = await supabase
      .from("listings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listingId)
      .select(
        `
        *,
        user:users(*)
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteListing(listingId: string): Promise<void> {
    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (error) throw error;
  }

  static async getListingById(listingId: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from("listings")
      .select(
        `
        *,
        user:users(*)
      `
      )
      .eq("id", listingId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data;
  }
}

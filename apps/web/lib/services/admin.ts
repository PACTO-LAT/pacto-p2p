import { createServerClient } from '@/lib/supabase';
import type { TokenOperation } from '@/lib/types';
import type { MerchantApplication } from '@/lib/types/admin';
import { StellarService } from './stellar';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class AdminService {
  static async mintTokens(
    token: string,
    amount: number,
    recipient: string,
    memo?: string,
    createdBy?: string
  ): Promise<TokenOperation> {
    const supabase = createServerClient();

    // Create operation record
    const { data: operation, error: insertError } = await supabase
      .from('token_operations')
      .insert({
        operation_type: 'mint',
        token,
        amount,
        stellar_address: recipient,
        memo,
        created_by: createdBy,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    try {
      // Execute minting on Stellar
      const txHash = await StellarService.mintToken(
        'ISSUER_ADDRESS', // Replace with actual issuer
        amount,
        token,
        recipient
      );

      // Update operation with success
      const { data: updatedOperation, error: updateError } = await supabase
        .from('token_operations')
        .update({
          transaction_hash: txHash,
          status: 'completed',
        })
        .eq('id', operation.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedOperation;
    } catch (error) {
      // Update operation with failure
      await supabase
        .from('token_operations')
        .update({
          status: 'failed',
        })
        .eq('id', operation.id);

      throw error;
    }
  }

  static async burnTokens(
    token: string,
    amount: number,
    address: string,
    memo?: string,
    createdBy?: string
  ): Promise<TokenOperation> {
    const supabase = createServerClient();

    // Create operation record
    const { data: operation, error: insertError } = await supabase
      .from('token_operations')
      .insert({
        operation_type: 'burn',
        token,
        amount,
        stellar_address: address,
        memo,
        created_by: createdBy,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    try {
      // Execute burning on Stellar
      const txHash = await StellarService.burnToken(address, amount, token);

      // Update operation with success
      const { data: updatedOperation, error: updateError } = await supabase
        .from('token_operations')
        .update({
          transaction_hash: txHash,
          status: 'completed',
        })
        .eq('id', operation.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedOperation;
    } catch (error) {
      // Update operation with failure
      await supabase
        .from('token_operations')
        .update({
          status: 'failed',
        })
        .eq('id', operation.id);

      throw error;
    }
  }

  static async getTokenOperations(): Promise<TokenOperation[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('token_operations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getPlatformStats() {
    const supabase = createServerClient();

    const [usersResult, listingsResult, escrowsResult, tradesResult] =
      await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase
          .from('listings')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),
        // Get all escrows for volume calculation (status is on-chain)
        supabase.from('escrows').select('fiat_amount'),
        // Get completed trades count from trades table
        supabase
          .from('trades')
          .select('id', { count: 'exact' })
          .eq('status', 'completed'),
      ]);

    const totalVolume =
      escrowsResult.data?.reduce(
        (sum, escrow) => sum + escrow.fiat_amount,
        0
      ) || 0;

    return {
      totalUsers: usersResult.count || 0,
      activeListings: listingsResult.count || 0,
      totalVolume,
      completedTrades: tradesResult.count || escrowsResult.data?.length || 0,
    };
  }

  static async getMerchantApplications(status?: string) {
    try {
      const supabase = createServerClient();
      let query = supabase
        .from('merchants')
        .select(`
        *,
        user:users!merchants_user_id_fkey(id, email, full_name, created_at)
      `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('verification_status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.warn(
        'Failed to load merchant applications from Supabase, falling back to mock data.',
        error
      );

      const mockApplications: MerchantApplication[] = [
        {
          id: 'charlie-trader',
          user_id: 'user-charlie',
          slug: 'charlie-trader',
          display_name: 'Charlie Trader',
          verification_status: 'pending',
          bio: 'Experienced P2P trader specializing in Latin American corridors.',
          location: 'San José, Costa Rica',
          languages: ['English', 'Spanish'],
          socials: {
            twitter: 'https://twitter.com/charlie_trader',
          },
          rating: 4.8,
          total_trades: 120,
          volume_traded: 150000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: {
            id: 'user-charlie',
            email: 'charlie@example.com',
            full_name: 'Charlie Trader',
            created_at: new Date().toISOString(),
          },
        },
        {
          id: 'eve-crypto-exchange',
          user_id: 'user-eve',
          slug: 'eve-crypto-exchange',
          display_name: 'Eve Crypto Exchange',
          verification_status: 'verified',
          bio: 'High-volume merchant providing instant swaps and competitive spreads.',
          location: 'Mexico City, Mexico',
          languages: ['English', 'Spanish', 'Portuguese'],
          socials: {
            website: 'https://evecrypto.exchange',
          },
          rating: 4.9,
          total_trades: 340,
          volume_traded: 450000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: {
            id: 'user-eve',
            email: 'support@evecrypto.exchange',
            full_name: 'Eve Crypto Exchange',
            created_at: new Date().toISOString(),
          },
        },
      ];

      if (status && status !== 'all') {
        return mockApplications.filter(
          (application) => application.verification_status === status
        );
      }

      return mockApplications;
    }
  }

  static async getMerchantApplicationById(id: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('merchants')
      .select(`
        *,
        user:users!merchants_user_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async approveMerchant(id: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('merchants')
      .update({
        verification_status: 'verified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async rejectMerchant(id: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('merchants')
      .update({
        verification_status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async revokeMerchant(id: string) {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('merchants')
      .update({
        verification_status: 'revoked',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

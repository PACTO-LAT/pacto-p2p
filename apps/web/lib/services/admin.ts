import { createAdminClient } from '@/lib/supabase';
import type { TokenOperation } from '@/lib/types';
import type { MerchantApplication } from '@/lib/types/admin';
import { StellarService } from './stellar';
import { AuditService } from './audit';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class AdminService {
  static async mintTokens(
    token: string,
    amount: number,
    recipient: string,
    memo?: string,
    createdBy?: string,
    auditContext?: { ipAddress?: string; userAgent?: string }
  ): Promise<TokenOperation> {
    const supabase = createAdminClient();

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

      // Log the successful mint operation
      if (createdBy) {
        await AuditService.logAdminAction({
          adminUserId: createdBy,
          action: 'token_minted',
          targetType: 'token_operation',
          targetId: updatedOperation.id,
          metadata: {
            token,
            amount,
            recipient,
            memo,
            transaction_hash: txHash,
          },
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        });
      }

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
    createdBy?: string,
    auditContext?: { ipAddress?: string; userAgent?: string }
  ): Promise<TokenOperation> {
    const supabase = createAdminClient();

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

      // Log the successful burn operation
      if (createdBy) {
        await AuditService.logAdminAction({
          adminUserId: createdBy,
          action: 'token_burned',
          targetType: 'token_operation',
          targetId: updatedOperation.id,
          metadata: {
            token,
            amount,
            address,
            memo,
            transaction_hash: txHash,
          },
          ipAddress: auditContext?.ipAddress,
          userAgent: auditContext?.userAgent,
        });
      }

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
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('token_operations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getPlatformStats() {
    const supabase = createAdminClient();

    const [usersResult, listingsResult, escrowsResult, tradesResult] =
      await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase
          .from('listings')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),
        // Get all escrows for volume calculation (status is on-chain)
        supabase
          .from('escrows')
          .select('fiat_amount'),
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

  /** Fetches all merchants with verification_status = 'pending' for admin review */
  static async getPendingMerchants() {
    return AdminService.getMerchantApplications('pending');
  }

  static async getMerchantApplications(status?: string) {
    const supabase = createAdminClient();
    let query = supabase
      .from('merchants')
      .select(
        `
        *,
        user:users!merchants_user_id_fkey(id, email, full_name, created_at)
      `
      )
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('verification_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  static async getMerchantApplicationById(id: string) {
    const supabase = createAdminClient();
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

  static async approveMerchant(
    id: string,
    auditContext?: {
      adminUserId: string;
      ipAddress?: string;
      userAgent?: string;
      reason?: string;
    }
  ) {
    const result = await AdminService.updateMerchantStatus(id, 'verified', auditContext?.reason);
    
    // Log the approval
    if (auditContext?.adminUserId) {
      await AuditService.logAdminAction({
        adminUserId: auditContext.adminUserId,
        action: 'merchant_approved',
        targetType: 'merchant',
        targetId: id,
        metadata: {
          reason: auditContext.reason,
          merchant_slug: result.slug,
          display_name: result.display_name,
        },
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      });
    }
    
    return result;
  }

  static async rejectMerchant(
    id: string,
    auditContext?: {
      adminUserId: string;
      ipAddress?: string;
      userAgent?: string;
      reason?: string;
    }
  ) {
    const result = await AdminService.updateMerchantStatus(id, 'rejected', auditContext?.reason);
    
    // Log the rejection
    if (auditContext?.adminUserId) {
      await AuditService.logAdminAction({
        adminUserId: auditContext.adminUserId,
        action: 'merchant_rejected',
        targetType: 'merchant',
        targetId: id,
        metadata: {
          reason: auditContext.reason,
          merchant_slug: result.slug,
          display_name: result.display_name,
        },
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      });
    }
    
    return result;
  }

  /** Unified method to approve or reject a merchant application */
  static async updateMerchantStatus(
    merchantId: string,
    status: 'verified' | 'rejected',
    statusMessage?: string
  ) {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('merchants')
      .update({
        verification_status: status,
        is_public: status === 'verified',
        status_message: statusMessage ?? null,
        status_updated_at: now,
        updated_at: now,
      })
      .eq('id', merchantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async revokeMerchant(
    id: string,
    auditContext?: {
      adminUserId: string;
      ipAddress?: string;
      userAgent?: string;
      reason?: string;
    }
  ) {
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('merchants')
      .update({
        verification_status: 'revoked',
        is_public: false,
        status_message: auditContext?.reason ?? null,
        status_updated_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log the revocation
    if (auditContext?.adminUserId) {
      await AuditService.logAdminAction({
        adminUserId: auditContext.adminUserId,
        action: 'merchant_revoked',
        targetType: 'merchant',
        targetId: id,
        metadata: {
          reason: auditContext.reason,
          merchant_slug: data.slug,
          display_name: data.display_name,
        },
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      });
    }

    return data;
  }
}

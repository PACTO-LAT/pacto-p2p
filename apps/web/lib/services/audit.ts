import { createAdminClient } from '@/lib/supabase';
import type { AuditLogEntry, AuditAction, AuditTargetType } from '@/lib/types/audit';

export class AuditService {
  /**
   * Log an admin action to the audit trail
   */
  static async logAdminAction({
    adminUserId,
    action,
    targetType,
    targetId,
    metadata = {},
    ipAddress,
    userAgent,
  }: {
    adminUserId: string;
    action: AuditAction;
    targetType: AuditTargetType;
    targetId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('admin_audit_logs')
      .insert({
        admin_user_id: adminUserId,
        action,
        target_type: targetType,
        target_id: targetId || null,
        metadata,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (error) {
      console.error('Failed to log admin action:', error);
      // Don't throw - audit logging failure shouldn't break the main operation
    }
  }

  /**
   * Get audit logs with optional filtering
   */
  static async getAuditLogs({
    adminUserId,
    action,
    targetType,
    limit = 100,
    offset = 0,
  }: {
    adminUserId?: string;
    action?: AuditAction;
    targetType?: AuditTargetType;
    limit?: number;
    offset?: number;
  } = {}): Promise<AuditLogEntry[]> {
    const supabase = createAdminClient();

    let query = supabase
      .from('admin_audit_logs')
      .select(`
        *,
        admin_user:users!admin_audit_logs_admin_user_id_fkey(
          id,
          email,
          full_name
        )
      `)
      .order('performed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (adminUserId) {
      query = query.eq('admin_user_id', adminUserId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get audit logs count for pagination
   */
  static async getAuditLogsCount({
    adminUserId,
    action,
    targetType,
  }: {
    adminUserId?: string;
    action?: AuditAction;
    targetType?: AuditTargetType;
  } = {}): Promise<number> {
    const supabase = createAdminClient();

    let query = supabase
      .from('admin_audit_logs')
      .select('*', { count: 'exact', head: true });

    if (adminUserId) {
      query = query.eq('admin_user_id', adminUserId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (targetType) {
      query = query.eq('target_type', targetType);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  }
}
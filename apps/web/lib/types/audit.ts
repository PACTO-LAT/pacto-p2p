export interface AuditLogEntry {
  id: string;
  admin_user_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  performed_at: string;
  admin_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export type AuditAction =
  | 'merchant_approved'
  | 'merchant_rejected'
  | 'merchant_revoked'
  | 'token_minted'
  | 'token_burned'
  | 'dispute_resolved';

export type AuditTargetType =
  | 'merchant'
  | 'token_operation'
  | 'escrow'
  | 'user';

export type NotificationType = 'escrow_released';

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface NotificationPrefs {
  email_trades: boolean;
  email_escrows: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

export interface NotificationDraft {
  user_id: string;
  type: NotificationType;
  escrow_id: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
}

export interface EscrowReleasedInput {
  escrowId: string;
  buyerId: string;
  sellerId: string;
  engagementId: string;
  amount: number;
}

export interface TransitionEvent {
  kind: NotificationType;
}

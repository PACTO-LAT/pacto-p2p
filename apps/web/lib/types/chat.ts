export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface TradeChat {
  id: string;
  escrow_id: string | null;
  engagement_id: string;
  buyer_id: string;
  seller_id: string;
  is_active: boolean;
  created_at: string;
}

export interface TradeMessage {
  id: string;
  chat_id: string;
  sender_id: string | null; // null for system messages
  content: string;
  message_type: MessageType;
  attachment_url: string | null;
  is_read: boolean;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface SystemMessageMetadata {
  event:
    | 'escrow_initialized'
    | 'funds_deposited'
    | 'payment_reported'
    | 'payment_confirmed'
    | 'funds_released'
    | 'dispute_raised';
  escrow_status?: string;
}

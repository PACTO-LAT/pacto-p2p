import { supabase } from '@/lib/supabase';
import type { SystemMessageMetadata } from '@/lib/types/chat';

const SYSTEM_MESSAGES: Record<
  SystemMessageMetadata['event'],
  (amount?: number, token?: string) => string
> = {
  escrow_initialized: () =>
    '🔒 Trade started. Waiting for seller to deposit funds.',
  funds_deposited: (amount, token) =>
    `💰 Seller deposited ${amount ?? ''} ${token ?? ''}. You can now proceed with your payment.`,
  payment_reported: () =>
    '📤 Buyer has reported payment. Awaiting seller confirmation.',
  payment_confirmed: () =>
    '✅ Seller confirmed payment receipt. Releasing funds…',
  funds_released: () =>
    '🎉 Trade complete. Funds have been released to buyer.',
  dispute_raised: () =>
    '⚠️ A dispute has been raised. Platform support will review this trade.',
};

export class ChatService {
  /**
   * Creates the chat room for a new escrow and inserts the first system message.
   * Should be called right after the escrow row is persisted.
   */
  static async createChatRoom({
    escrowId,
    engagementId,
    buyerId,
    sellerId,
  }: {
    escrowId: string;
    engagementId: string;
    buyerId: string;
    sellerId: string;
  }): Promise<string | null> {
    const { data, error } = await supabase
      .from('trade_chats')
      .insert({
        escrow_id: escrowId,
        engagement_id: engagementId,
        buyer_id: buyerId,
        seller_id: sellerId,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create chat room:', error);
      return null;
    }

    await supabase.from('trade_messages').insert({
      chat_id: data.id,
      sender_id: null,
      content: SYSTEM_MESSAGES.escrow_initialized(),
      message_type: 'system',
      metadata: { event: 'escrow_initialized' },
    });

    return data.id;
  }

  /**
   * Inserts a system message into the chat for a given engagement.
   * Fails silently — system messages should never break the main flow.
   */
  static async insertSystemMessage({
    engagementId,
    event,
    amount,
    token,
  }: {
    engagementId: string;
    event: SystemMessageMetadata['event'];
    amount?: number;
    token?: string;
  }): Promise<void> {
    const { data: chat } = await supabase
      .from('trade_chats')
      .select('id')
      .eq('engagement_id', engagementId)
      .single();

    if (!chat) return;

    const { error } = await supabase.from('trade_messages').insert({
      chat_id: chat.id,
      sender_id: null,
      content: SYSTEM_MESSAGES[event](amount, token),
      message_type: 'system',
      metadata: { event },
    });

    if (error) {
      console.error('Failed to insert system message:', error);
    }
  }
}

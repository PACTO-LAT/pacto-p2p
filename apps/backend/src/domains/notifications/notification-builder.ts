import type {
  EscrowReleasedInput,
  NotificationDraft,
} from '@domains/notifications/notifications.types';

export function buildReleasedNotifications(
  input: EscrowReleasedInput
): NotificationDraft[] {
  const { escrowId, buyerId, sellerId, engagementId, amount } = input;
  const common = { type: 'escrow_released' as const, escrow_id: escrowId };
  return [
    {
      ...common,
      user_id: buyerId,
      title: 'Fondos liberados',
      body: `Los fondos de tu escrow ${engagementId} fueron liberados al vendedor.`,
      data: {
        engagement_id: engagementId,
        amount,
        role: 'buyer',
        counterparty_id: sellerId,
      },
    },
    {
      ...common,
      user_id: sellerId,
      title: 'Recibiste la liberación de fondos',
      body: `Se liberaron los fondos del escrow ${engagementId}. La operación se completó.`,
      data: {
        engagement_id: engagementId,
        amount,
        role: 'seller',
        counterparty_id: buyerId,
      },
    },
  ];
}

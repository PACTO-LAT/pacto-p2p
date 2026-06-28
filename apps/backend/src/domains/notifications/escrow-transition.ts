import type { TransitionEvent } from '@domains/notifications/notifications.types';

export function detectEscrowTransition(
  oldStatus: string | null | undefined,
  newStatus: string
): TransitionEvent | null {
  // Anti-backfill: a never-indexed escrow (null prior) is treated as baseline.
  if (oldStatus == null) {
    return null;
  }
  if (oldStatus !== 'released' && newStatus === 'released') {
    return { kind: 'escrow_released' };
  }
  return null;
}

import { Escrow } from '@/lib/types/escrow';

const DEFAULT_ESCROW_CANCELLATION_GRACE_HOURS = 24;

export function getEscrowCreatedAt(escrow: Escrow): Date {
  const seconds = escrow.createdAt?._seconds ?? 0;
  const nanoseconds = escrow.createdAt?._nanoseconds ?? 0;
  return new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000));
}

export function getEscrowCancellationGraceHours(): number {
  const configuredHours = Number(
    process.env.NEXT_PUBLIC_ESCROW_CANCELLATION_GRACE_HOURS
  );

  if (Number.isFinite(configuredHours) && configuredHours > 0) {
    return configuredHours;
  }

  return DEFAULT_ESCROW_CANCELLATION_GRACE_HOURS;
}

export function hasEscrowCancellationGraceElapsed(escrow: Escrow): boolean {
  const createdAt = getEscrowCreatedAt(escrow);
  const graceMs = getEscrowCancellationGraceHours() * 60 * 60 * 1000;
  return Date.now() - createdAt.getTime() >= graceMs;
}

export function getEscrowRole(
  escrow: Escrow,
  userAddress: string
): 'buyer' | 'seller' | null {
  // TW Role Inversion: serviceProvider = buyer (submits fiat payment evidence),
  // approver = seller (verifies fiat receipt and releases crypto).
  if (escrow.roles.serviceProvider === userAddress) {
    return 'buyer';
  }
  if (escrow.roles.approver === userAddress) {
    return 'seller';
  }
  return null;
}

export function canReportPayment(
  escrow: Escrow,
  userRole: 'buyer' | 'seller'
): boolean {
  // Only buyer (TW serviceProvider) reports off-chain fiat payment
  if (userRole !== 'buyer') return false;
  if (escrow.flags?.resolved || escrow.flags?.released) return false;
  if (escrow.milestones[0].status === 'pendingApproval') return false;
  if ((escrow.balance ?? 0) <= 0) return false;
  return true;
}

export function canConfirmPayment(
  escrow: Escrow,
  userRole: 'buyer' | 'seller'
): boolean {
  // Only seller (TW approver) verifies fiat receipt
  if (userRole !== 'seller') return false;
  if (escrow.flags?.resolved || escrow.flags?.released) return false;
  if (escrow.balance === 0) return false;
  if (escrow.milestones[0].approved) return false;
  return escrow.milestones[0].status === 'pendingApproval';
}

export function canDeposit(
  escrow: Escrow,
  userRole: 'buyer' | 'seller'
): boolean {
  // Only seller funds the initial crypto escrow
  if (userRole !== 'seller') return false;
  if (escrow.flags?.released || escrow.flags?.resolved) return false;
  return escrow.balance === 0;
}

export function canReleaseFunds(
  escrow: Escrow,
  userRole: 'buyer' | 'seller'
): boolean {
  // Only seller (TW releaseSigner) can trigger final release after approval
  if (userRole !== 'seller') return false;
  if (!escrow.milestones[0].approved) return false;
  return escrow.balance !== 0;
}

export function canDispute(escrow: Escrow): boolean {
  if (
    escrow.flags?.disputed ||
    escrow.flags?.resolved ||
    escrow.flags?.released
  )
    return false;
  return escrow.balance !== 0;
}

export function canCancel(
  escrow: Escrow,
  userRole: 'buyer' | 'seller'
): boolean {
  if (userRole !== 'buyer') return false;
  if (escrow.flags?.disputed || escrow.flags?.resolved || escrow.flags?.released) {
    return false;
  }
  if (escrow.balance !== 0) return false;
  return hasEscrowCancellationGraceElapsed(escrow);
}

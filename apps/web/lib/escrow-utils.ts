import { Escrow } from '@/lib/types/escrow';

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
  return true;
}

export function canConfirmPayment(
  escrow: Escrow,
  userRole: 'buyer' | 'seller'
): boolean {
  // Only seller (TW approver) verifies fiat receipt
  if (userRole !== 'seller') return false;
  return !escrow.milestones[0].approved;
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

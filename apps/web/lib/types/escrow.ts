import type { Escrow } from '@pacto-p2p/types';

export type { Escrow };

export interface EscrowMilestone {
  status: 'pendingApproval' | 'approved' | 'rejected';
  evidence?: string;
  approved?: boolean;
}

export interface EscrowFlags {
  disputed?: boolean;
  resolved?: boolean;
  released?: boolean;
}

export interface EscrowRoles {
  // TW Role Inversion: approver = seller, serviceProvider = buyer
  /**
   * The address of the approver (seller in the Trust Wallet context).
   */
  approver: string;
  /**
   * The address of the service provider (buyer in the Trust Wallet context).
   */
  serviceProvider: string;
}

export interface EscrowTrustline {
  address: string;
}

export interface ReportPaymentData {
  evidence: string;
}

export interface EscrowFilters {
  role: 'buyer' | 'seller';
  isActive: boolean;
}

export interface ReportPaymentData {
  evidence: string;
}

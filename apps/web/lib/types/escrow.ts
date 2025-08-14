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
  approver: string;
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

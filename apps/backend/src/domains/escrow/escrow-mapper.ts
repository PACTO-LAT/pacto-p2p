import type { Escrow } from '@pacto-p2p/types';

export interface EscrowPatch {
  balance: number;
  token_amount: number;
  on_chain_flags: Record<string, boolean>;
  on_chain_status: string;
  on_chain_snapshot: Escrow;
  last_indexed_at: string;
}

export function toEscrowPatch(escrow: Escrow, now: number): EscrowPatch {
  const flags = (escrow.flags ?? {}) as Record<string, boolean>;
  const balance = Number(escrow.balance ?? 0);
  const tokenAmount = Number(escrow.amount ?? 0);

  let status: string;
  if (flags.resolved) {
    status = 'resolved';
  } else if (flags.released) {
    status = 'released';
  } else if (flags.disputed) {
    status = 'disputed';
  } else if (balance > 0) {
    status = 'funded';
  } else {
    status = 'active';
  }

  return {
    balance: Number.isFinite(balance) ? balance : 0,
    token_amount: Number.isFinite(tokenAmount) ? tokenAmount : 0,
    on_chain_flags: flags,
    on_chain_status: status,
    on_chain_snapshot: escrow,
    last_indexed_at: new Date(now).toISOString(),
  };
}

export interface TradeRow {
  status: string;
  fiat_amount: number | string;
  completed_at: string | null;
  buyer_id: string | null;
  seller_id: string | null;
}

export interface TradeSummary {
  completed: number;
  disputed: number;
  cancelledFailed: number;
  volume: number;
  daysSinceLastCompleted: number | null;
}

const DAY_MS = 86_400_000;

export function summarizeTrades(trades: TradeRow[], now: number): TradeSummary {
  let completed = 0;
  let disputed = 0;
  let cancelledFailed = 0;
  let volume = 0;
  let lastCompletedMs: number | null = null;

  for (const tr of trades) {
    if (tr.buyer_id && tr.seller_id && tr.buyer_id === tr.seller_id) {
      continue; // self-trade
    }
    const amount = Number(tr.fiat_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      continue; // zero/invalid amount
    }
    switch (tr.status) {
      case 'completed': {
        completed += 1;
        volume += amount;
        if (tr.completed_at) {
          const ms = Date.parse(tr.completed_at);
          if (
            !Number.isNaN(ms) &&
            (lastCompletedMs === null || ms > lastCompletedMs)
          ) {
            lastCompletedMs = ms;
          }
        }
        break;
      }
      case 'disputed':
      case 'resolved':
        disputed += 1;
        break;
      case 'cancelled':
      case 'failed':
        cancelledFailed += 1;
        break;
      default:
        break; // 'pending' and anything else are ignored
    }
  }

  return {
    completed,
    disputed,
    cancelledFailed,
    volume,
    daysSinceLastCompleted:
      lastCompletedMs === null ? null : (now - lastCompletedMs) / DAY_MS,
  };
}

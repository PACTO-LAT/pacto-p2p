import { Injectable } from '@nestjs/common';
// biome-ignore lint/style/useImportType: required for NestJS dependency injection
import { ConfigService } from '@nestjs/config';

export interface ReputationInput {
  completed: number;
  disputed: number;
  cancelledFailed: number;
  volume: number;
  daysSinceLastCompleted: number | null;
}

interface ReputationWeights {
  wCompletion: number;
  wDispute: number;
  smoothingK: number;
  neutral: number;
  recencyDays: number;
  decay: number;
  volumeWeight: number;
  volumeSat: number;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

@Injectable()
export class ReputationService {
  private readonly w: ReputationWeights;

  constructor(config: ConfigService) {
    this.w = {
      wCompletion: config.get<number>('REPUTATION_W_COMPLETION', 1.0),
      wDispute: config.get<number>('REPUTATION_W_DISPUTE', 1.5),
      smoothingK: config.get<number>('REPUTATION_SMOOTHING_K', 8),
      neutral: config.get<number>('REPUTATION_NEUTRAL', 0.6),
      recencyDays: config.get<number>('REPUTATION_RECENCY_DAYS', 90),
      decay: config.get<number>('REPUTATION_DECAY', 0.9),
      volumeWeight: config.get<number>('REPUTATION_VOLUME_WEIGHT', 0.05),
      volumeSat: config.get<number>('REPUTATION_VOLUME_SAT', 10000),
    };
  }

  rates(input: ReputationInput): {
    completionRate: number;
    disputeRate: number;
  } {
    const f = input.completed + input.disputed + input.cancelledFailed;
    if (f <= 0) {
      return { completionRate: 0, disputeRate: 0 };
    }
    return {
      completionRate: Math.round((input.completed / f) * 10000) / 100,
      disputeRate: Math.round((input.disputed / f) * 10000) / 100,
    };
  }

  score(input: ReputationInput): number {
    const { completed: c, disputed: d, cancelledFailed: x, volume: v } = input;
    const f = c + d + x;
    const completionRatio = f > 0 ? c / f : 0;
    const disputeRatio = f > 0 ? d / f : 0;

    const q = clamp(
      this.w.wCompletion * completionRatio - this.w.wDispute * disputeRatio,
      0,
      1
    );
    const conf = c / (c + this.w.smoothingK);
    let qAdj = conf * q + (1 - conf) * this.w.neutral;
    if (
      input.daysSinceLastCompleted !== null &&
      input.daysSinceLastCompleted > this.w.recencyDays
    ) {
      qAdj *= this.w.decay;
    }
    const vbonus =
      this.w.volumeWeight *
      Math.min(1, Math.log1p(Math.max(0, v)) / Math.log1p(this.w.volumeSat));
    const final = clamp(qAdj + vbonus, 0, 1);
    return Math.round(final * 5 * 100) / 100;
  }
}

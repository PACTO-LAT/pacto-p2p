'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import type { MerchantKpis } from '@/lib/types/merchant';

export function KpiCards({ kpis }: { kpis: MerchantKpis }) {
  const items = [
    { label: 'Completion', value: `${kpis.completion_rate_pct.toFixed(1)}%` },
    { label: 'Disputes', value: `${kpis.dispute_rate_pct.toFixed(1)}%` },
    { label: 'Total Trades', value: kpis.total_trades.toLocaleString() },
    { label: '30d Volume', value: `$${kpis.volume_30d.toLocaleString()}` },
    {
      label: 'Median Release',
      value:
        kpis.median_release_minutes === null
          ? 'N/A'
          : `${kpis.median_release_minutes}m`,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="feature-card-dark rounded-2xl p-4">
            <div className="text-xs text-muted-foreground">{it.label}</div>
            <div className="mt-2 text-lg font-semibold text-foreground">
              {it.value}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

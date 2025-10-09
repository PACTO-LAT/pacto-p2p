'use client';

import { motion } from 'framer-motion';
import { Clock, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { MerchantKpis } from '@/lib/types/merchant';

export function KpiCards({ kpis }: { kpis: MerchantKpis }) {
  const items = [
    {
      label: 'Completion',
      value: `${kpis.completion_rate_pct.toFixed(1)}%`,
      icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: 'Disputes',
      value: `${kpis.dispute_rate_pct.toFixed(1)}%`,
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: 'Total Trades',
      value: kpis.total_trades.toLocaleString(),
      icon: <Wallet className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: '30d Volume',
      value: `$${kpis.volume_30d.toLocaleString()}`,
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
    },
    {
      label: 'Median Release',
      value:
        kpis.median_release_minutes === null
          ? 'N/A'
          : `${kpis.median_release_minutes}m`,
      icon: <Clock className="h-4 w-4 text-emerald-500" />,
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((it) => (
        <motion.div
          key={it.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-background to-muted/40 border border-border/50 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{it.label}</div>
                <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{it.value}</div>
              </div>
              <div className="shrink-0 rounded-md bg-emerald-500/10 p-2">{it.icon}</div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

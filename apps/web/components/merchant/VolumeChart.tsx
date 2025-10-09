'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import type { VolumePoint } from '@/lib/types/merchant';

export function VolumeChart({ data }: { data: VolumePoint[] }) {
  return (
    <Card className="rounded-2xl p-4 bg-gradient-to-b from-background to-muted/40 border border-border/50">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-foreground">30d Volume</div>
        <div className="text-xs text-muted-foreground">USD</div>
      </div>
      <div className="h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <defs>
              <linearGradient id="vgrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="d" hide />
            <YAxis hide />
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString()}`}
              labelFormatter={() => ''}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#10b981"
              fill="url(#vgrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

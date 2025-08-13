'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import type { SpeedBucket } from '@/lib/types/merchant';

export function SpeedHistogram({ data }: { data: SpeedBucket[] }) {
  return (
    <Card className="feature-card-dark rounded-2xl p-4">
      <div className="mb-3 text-sm font-medium text-foreground">Release Speed</div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
          >
            <XAxis
              dataKey="bucketLabel"
              tick={{ fill: 'currentColor' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide />
            <Tooltip labelFormatter={() => ''} />
            <Bar dataKey="count" fill="#60a5fa" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

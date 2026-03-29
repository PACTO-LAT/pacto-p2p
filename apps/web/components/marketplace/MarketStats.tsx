'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketStats as MarketStatsType } from '@/lib/types/marketplace';

interface MarketStatsProps {
  stats: MarketStatsType;
}

function ChangeBadge({ value, suffix }: { value: number; suffix: string }) {
  const positive = value >= 0;
  return (
    <p className={`text-sm flex items-center mt-1 ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
      {positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
      {positive ? '+' : ''}{value}% {suffix}
    </p>
  );
}

export function MarketStats({ stats }: MarketStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Active Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{stats.activeListings}</div>
          <ChangeBadge value={stats.activeListingsChange} suffix="vs last week" />
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Total Listed Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            ${stats.totalVolume24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <ChangeBadge value={stats.volumeChange} suffix="vs yesterday" />
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Avg. Listing Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            ${stats.avgTradeSize.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <ChangeBadge value={stats.tradeSizeChange} suffix="vs last week" />
        </CardContent>
      </Card>
    </div>
  );
}

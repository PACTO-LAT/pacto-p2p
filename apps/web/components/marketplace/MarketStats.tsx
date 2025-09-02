'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketStats as MarketStatsType } from '@/lib/types/marketplace';

interface MarketStatsProps {
  stats: MarketStatsType;
}

export function MarketStats({ stats }: MarketStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Active Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-1">
            {stats.activeListings}
          </div>
          <p
            className={`text-sm flex items-center ${
              stats.activeListingsChange >= 0
                ? 'text-emerald-600'
                : 'text-red-600'
            }`}
          >
            {stats.activeListingsChange >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {stats.activeListingsChange >= 0 ? '+' : ''}
            {stats.activeListingsChange}% from last week
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Total Volume (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-1">
            ${stats.totalVolume24h.toLocaleString()}
          </div>
          <p
            className={`text-sm flex items-center ${
              stats.volumeChange >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {stats.volumeChange >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {stats.volumeChange >= 0 ? '+' : ''}
            {stats.volumeChange}% from yesterday
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Avg. Trade Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground mb-1">
            ${stats.avgTradeSize.toLocaleString()}
          </div>
          <p
            className={`text-sm flex items-center ${
              stats.tradeSizeChange >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {stats.tradeSizeChange >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {stats.tradeSizeChange >= 0 ? '+' : ''}
            {stats.tradeSizeChange}% from last week
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { TrendingUp, Users, LayoutList, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformStats as PlatformStatsType } from '@/lib/types/admin';

interface PlatformStatsProps {
  stats: PlatformStatsType;
}

export function PlatformStats({ stats }: PlatformStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-foreground" />
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.totalUsers.toLocaleString()}
          </div>
          <p className="text-sm text-emerald-500 mt-1">+12% this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <LayoutList className="w-4 h-4 text-foreground" />
            Active Listings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.activeListings}
          </div>
          <p className="text-sm text-blue-600 mt-1">Across all tokens</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-foreground" />
            Total Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            ${stats.totalVolume.toLocaleString()}
          </div>
          <p className="text-sm text-emerald-500 mt-1">+25% this week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-foreground" />
            Completed Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {stats.completedTrades}
          </div>
          <p className="text-sm text-gray-600 mt-1">98.5% success rate</p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Star, TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { ProfileStatsData } from './types';

interface ProfileStatsProps {
  stats: ProfileStatsData;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <Card className="feature-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Reputation
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-foreground">
              {stats.reputation_score}
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Trades
          </span>
          <span className="text-sm font-medium text-foreground">
            {stats.total_trades}
          </span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Total Volume
          </span>
          <span className="text-sm font-medium text-foreground">
            ${stats.total_volume.toLocaleString()}
          </span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Member since
          </span>
          <span className="text-sm font-medium text-foreground">
            {new Date(stats.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

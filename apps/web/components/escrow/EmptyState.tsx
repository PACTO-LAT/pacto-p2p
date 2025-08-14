'use client';

import { Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function EmptyState() {
  return (
    <Card className="glass-card">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-muted/50 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center glow-emerald">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No escrows found
        </h3>
        <p className="text-muted-foreground mb-4">
          You don&apos;t have any active escrow contracts yet.
        </p>
      </CardContent>
    </Card>
  );
}

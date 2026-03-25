'use client';

import { Card, CardContent } from '@/components/ui/card';

export function EmptyState() {
  return (
    <Card className="glass-card">
      <CardContent className="p-12 text-center">
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

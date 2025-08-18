'use client';

import { AlertCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEscrowSelection } from '@/hooks/use-escrow-selection';

export function EscrowStatusDisplay() {
  const { selectedEscrow, hasSelectedEscrow } = useEscrowSelection();

  if (!hasSelectedEscrow()) {
    return (
      <Card className="feature-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-emerald-400" />
            Escrow Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No escrow selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="feature-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="w-5 h-5 text-emerald-400" />
          Selected Escrow Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Engagement ID:
          </span>
          <Badge
            variant="outline"
            className="font-mono text-xs glass-effect-light"
          >
            {selectedEscrow?.engagementId}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Amount:</span>
          <span className="font-semibold text-foreground">
            {selectedEscrow?.amount} {selectedEscrow?.title}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Status:</span>
          <div className="flex items-center gap-2">
            {selectedEscrow?.flags?.released ? (
              <Badge className="glass-effect text-emerald-400 border-emerald-500/30">
                Released
              </Badge>
            ) : selectedEscrow?.flags?.disputed ? (
              <Badge className="glass-effect text-red-400 border-red-500/30">
                Disputed
              </Badge>
            ) : (
              <Badge className="glass-effect text-blue-400 border-blue-500/30">
                Active
              </Badge>
            )}
          </div>
        </div>

        {selectedEscrow?.flags?.disputed && (
          <div className="flex items-start gap-2 p-3 glass-effect-light rounded-lg border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
            <div className="text-sm text-red-300">
              <p className="font-medium">Escrow in dispute</p>
              <p className="text-xs">
                Started by: {selectedEscrow.disputeStartedBy?.slice(0, 8)}...
                {selectedEscrow.disputeStartedBy?.slice(-8)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

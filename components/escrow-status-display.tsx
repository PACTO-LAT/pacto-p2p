"use client";

import { useEscrowSelection } from "@/hooks/use-escrow-selection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle } from "lucide-react";

export function EscrowStatusDisplay() {
  const { selectedEscrow, hasSelectedEscrow } = useEscrowSelection();

  if (!hasSelectedEscrow()) {
    return (
      <Card className="feature-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="w-5 h-5 text-emerald-400" />
            Estado del Escrow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No hay ningún escrow seleccionado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="feature-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="w-5 h-5 text-emerald-400" />
          Estado del Escrow Seleccionado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">ID del Engagement:</span>
          <Badge variant="outline" className="font-mono text-xs glass-effect-light">
            {selectedEscrow?.engagementId}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Cantidad:</span>
          <span className="font-semibold text-foreground">
            {selectedEscrow?.amount} {selectedEscrow?.title}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Estado:</span>
          <div className="flex items-center gap-2">
            {selectedEscrow?.flags?.released ? (
              <Badge className="glass-effect text-emerald-400 border-emerald-500/30">Liberado</Badge>
            ) : selectedEscrow?.flags?.disputed ? (
              <Badge className="glass-effect text-red-400 border-red-500/30">Disputado</Badge>
            ) : (
              <Badge className="glass-effect text-blue-400 border-blue-500/30">Activo</Badge>
            )}
          </div>
        </div>

        {selectedEscrow?.flags?.disputed && (
          <div className="flex items-start gap-2 p-3 glass-effect-light rounded-lg border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
            <div className="text-sm text-red-300">
              <p className="font-medium">Escrow en disputa</p>
              <p className="text-xs">
                Iniciado por: {selectedEscrow.disputeStartedBy?.slice(0, 8)}...
                {selectedEscrow.disputeStartedBy?.slice(-8)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

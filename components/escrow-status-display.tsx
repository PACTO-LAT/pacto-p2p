"use client";

import { useEscrowSelection } from "@/hooks/use-escrow-selection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertCircle } from "lucide-react";

export function EscrowStatusDisplay() {
  const { selectedEscrow, hasSelectedEscrow } = useEscrowSelection();

  if (!hasSelectedEscrow()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Estado del Escrow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">
            No hay ningún escrow seleccionado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Estado del Escrow Seleccionado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">ID del Engagement:</span>
          <Badge variant="outline" className="font-mono text-xs">
            {selectedEscrow?.engagementId}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Cantidad:</span>
          <span className="font-semibold">
            {selectedEscrow?.amount} {selectedEscrow?.title}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado:</span>
          <div className="flex items-center gap-2">
            {selectedEscrow?.flags?.released ? (
              <Badge className="bg-green-100 text-green-800">Liberado</Badge>
            ) : selectedEscrow?.flags?.disputed ? (
              <Badge className="bg-red-100 text-red-800">Disputado</Badge>
            ) : (
              <Badge className="bg-blue-100 text-blue-800">Activo</Badge>
            )}
          </div>
        </div>

        {selectedEscrow?.flags?.disputed && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
            <div className="text-sm text-red-700">
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

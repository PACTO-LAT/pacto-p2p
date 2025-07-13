import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ExternalLink, Upload, AlertTriangle } from "lucide-react";
import { TokenIcon } from "@/components/token-icon";
import { TradeTypeBadge } from "@/components/trade-type-badge";
import { StatusBadge } from "@/components/status-badge";
import { DashboardListing, DashboardEscrow } from "@/lib/types";
import { getStatusColor, formatDate, formatAmount, formatCurrency } from "@/lib/dashboard-utils";

interface TradeCardProps {
  trade: DashboardListing | DashboardEscrow;
  onAction?: (trade: DashboardListing | DashboardEscrow, action: string) => void;
  onOpenDialog?: (trade: DashboardListing | DashboardEscrow, type: "receipt" | "dispute") => void;
}

const isListing = (trade: DashboardListing | DashboardEscrow): trade is DashboardListing => {
  return 'rate' in trade && 'fiatCurrency' in trade;
};

const isEscrow = (trade: DashboardListing | DashboardEscrow): trade is DashboardEscrow => {
  return 'progress' in trade;
};

export function TradeCard({ trade, onAction, onOpenDialog }: TradeCardProps) {
  const renderTradeInfo = () => {
    if (isListing(trade)) {
      return (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Tasa:</span>{" "}
            {trade.rate} {trade.fiatCurrency}/{trade.token}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Creado:</span>{" "}
            {formatDate(trade.created)}
          </p>
        </div>
      );
    }

    if (isEscrow(trade)) {
      return (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">ID:</span> {trade.id}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">
              {trade.type === "sell" ? "Comprador" : "Vendedor"}:
            </span>{" "}
            <span className="font-mono text-xs bg-muted/50 backdrop-blur-sm px-2 py-1 rounded">
              {trade.type === "sell" ? trade.buyer : trade.seller}
            </span>
          </p>
        </div>
      );
    }

    return null;
  };

  const renderRightSection = () => {
    if (isListing(trade)) {
      return (
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={trade.status} />
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(trade.amount * trade.rate, trade.fiatCurrency)}
            </p>
          </div>
        </div>
      );
    }

    if (isEscrow(trade)) {
      return (
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={trade.status} />
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Progreso</p>
            <p className="text-xl font-bold text-foreground">
              {trade.progress}%
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderProgress = () => {
    if (isEscrow(trade)) {
      return (
        <div className="mb-6">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-muted-foreground">Estado del Escrow</span>
            <span className="text-foreground">{trade.progress}% Completado</span>
          </div>
          <div className="relative">
            <Progress value={trade.progress} className="h-3" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white drop-shadow-sm">
                {trade.progress}%
              </span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderActions = () => {
    if (isListing(trade)) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="btn-emerald-outline"
            onClick={() => onAction?.(trade, "view")}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Ver
          </Button>
          <Button
            size="sm"
            className="btn-emerald"
            onClick={() => onAction?.(trade, "manage")}
          >
            Gestionar
          </Button>
        </div>
      );
    }

    if (isEscrow(trade)) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="btn-emerald-outline"
            onClick={() => onAction?.(trade, "view")}
          >
            Ver Detalles
          </Button>
          {trade.status === "awaiting_payment" && trade.type === "buy" && (
            <Button
              size="sm"
              className="btn-emerald"
              onClick={() => onOpenDialog?.(trade, "receipt")}
            >
              <Upload className="w-4 h-4 mr-1" />
              Subir Recibo
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-red-200/50 text-red-600 hover:bg-red-50/50 backdrop-blur-sm"
            onClick={() => onOpenDialog?.(trade, "dispute")}
          >
            <AlertTriangle className="w-4 h-4 mr-1" />
            Disputa
          </Button>
        </div>
      );
    }

    return null;
  };

  const renderFooterInfo = () => {
    if (isListing(trade)) {
      return (
        <>
          <span className="text-sm text-muted-foreground">
            ID: #{trade.id}
          </span>
        </>
      );
    }

    if (isEscrow(trade)) {
      return (
        <span className="text-sm text-muted-foreground">
          Creado: {formatDate(trade.created)}
        </span>
      );
    }

    return null;
  };

  return (
    <Card className="card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fade-in">
      <CardContent className="p-0">
        <div className="p-6">
          <div className={`flex items-start justify-between ${isEscrow(trade) ? 'mb-6' : 'mb-4'}`}>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <TradeTypeBadge
                  type={trade.type}
                  className="mb-3"
                />
                <TokenIcon token={trade.token} size="lg" />
              </div>

              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                                  <h3 className="text-2xl font-bold text-foreground">
                  {formatAmount(trade.amount)}
                </h3>
                  <span className="text-lg font-semibold text-muted-foreground">
                    {trade.token}
                  </span>
                </div>
                {renderTradeInfo()}
              </div>
            </div>

            {renderRightSection()}
          </div>

          {renderProgress()}

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(trade.status)}`}
                  ></div>
                  <span className="text-sm font-medium text-muted-foreground capitalize">
                    {trade.status.replace("_", " ")}
                  </span>
                </div>
                {renderFooterInfo()}
              </div>

              {renderActions()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 
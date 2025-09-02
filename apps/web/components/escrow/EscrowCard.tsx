'use client';

import { ExternalLink, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatAmount } from '@/lib/dashboard-utils';
import { getTrustlineName } from '@/utils/getTrustline';
import { Escrow } from '@/lib/types/escrow';

interface EscrowCardProps {
  escrow: Escrow;
  onClick: (escrow: Escrow) => void;
}

export function EscrowCard({ escrow, onClick }: EscrowCardProps) {
  const getStatusText = () => {
    if (escrow.flags?.resolved || escrow.flags?.released) {
      return { text: 'Completed', color: 'text-emerald-600' };
    }
    return { text: 'In Progress', color: 'text-muted-foreground' };
  };

  const status = getStatusText();

  return (
    <Card
      className="card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fade-in cursor-pointer"
      onClick={() => onClick(escrow)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-xl text-foreground">
                  {escrow.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  ID: {escrow.engagementId}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${status.color}`}>
                {status.text}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium text-foreground">{escrow.description}</p>
          </div>

          {/* Amount and Details */}
          <div className="bg-muted/50 backdrop-blur-sm p-4 rounded-lg border border-border/50">
            <div className="flex items-center justify-center gap-10">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatAmount(escrow.amount)}{' '}
                  {getTrustlineName(escrow.trustline.address)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Balance</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatAmount(escrow.balance || 0)}{' '}
                  {getTrustlineName(escrow.trustline.address)}
                </p>
              </div>
            </div>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Seller Address
                </p>
                <div className="flex items-center gap-2 p-2 bg-muted/50 backdrop-blur-sm rounded-md">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs text-foreground">
                    {escrow.roles.approver.slice(0, 8)}...
                    {escrow.roles.approver.slice(-8)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Buyer Address
                </p>
                <div className="flex items-center gap-2 p-2 bg-muted/50 backdrop-blur-sm rounded-md">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-xs text-foreground">
                    {escrow.roles.serviceProvider.slice(0, 8)}...
                    {escrow.roles.serviceProvider.slice(-8)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Asset</p>
                <div className="p-2 bg-muted/50 backdrop-blur-sm rounded-md">
                  <span className="font-mono text-xs text-foreground">
                    {getTrustlineName(escrow.trustline.address)}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Engagement ID
                </p>
                <div className="p-2 bg-emerald-50/80 backdrop-blur-sm rounded-md">
                  <span className="font-mono text-sm font-medium text-emerald-700">
                    {escrow.engagementId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border/50">
            {escrow.contractId && (
              <Button
                variant="outline"
                size="sm"
                className="btn-emerald-outline"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    `https://viewer.trustlesswork.com/${escrow.contractId}`,
                    '_blank'
                  );
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Escrow Viewer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

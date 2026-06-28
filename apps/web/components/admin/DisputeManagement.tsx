'use client';

import type { Escrow } from '@pacto-p2p/types';
import { Loader2, Scale } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDisputedEscrows } from '@/hooks/use-disputed-escrows';
import { DisputeResolutionModal } from './DisputeResolutionModal';

export function DisputeManagement() {
  const { data: escrows, isLoading, error, refetch } = useDisputedEscrows();
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">
          Failed to load disputed escrows. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dispute Management</h2>
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
        >
          {escrows?.length ?? 0} open
        </Badge>
      </div>

      {!escrows || escrows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-lg border border-gray-200 dark:border-gray-700">
          <Scale className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No disputed escrows found.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-muted/50">
                <th className="text-left py-3 px-4 font-medium">Contract ID</th>
                <th className="text-left py-3 px-4 font-medium">Buyer</th>
                <th className="text-left py-3 px-4 font-medium">Seller</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Balance</th>
                <th className="text-right py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {escrows.map((escrow) => (
                <tr
                  key={escrow.contractId ?? escrow.engagementId}
                  className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-muted/30"
                >
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground max-w-[140px] truncate">
                    {escrow.contractId ?? '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground max-w-[140px] truncate">
                    {/* buyer = serviceProvider due to role inversion */}
                    {escrow.roles.serviceProvider}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground max-w-[140px] truncate">
                    {/* seller = approver due to role inversion */}
                    {escrow.roles.approver}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {escrow.amount} {escrow.trustline?.name ?? ''}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold">
                    {escrow.balance ?? '—'} {escrow.trustline?.name ?? ''}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      className="btn-emerald"
                      onClick={() => setSelectedEscrow(escrow)}
                    >
                      Resolve
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedEscrow && (
        <DisputeResolutionModal
          escrow={selectedEscrow}
          onClose={() => setSelectedEscrow(null)}
          onResolved={() => {
            setSelectedEscrow(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

import { Progress } from '@/components/ui/progress';
import type { DashboardEscrow } from '@/lib/types';

interface TradeProgressProps {
  escrow: DashboardEscrow;
}

export function TradeProgress({ escrow }: TradeProgressProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm font-medium mb-2">
        <span className="text-muted-foreground">Escrow Status</span>
        <span className="text-foreground">{escrow.progress}% Completed</span>
      </div>
      <div className="relative">
        <Progress value={escrow.progress} className="h-3" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white drop-shadow-sm">
            {escrow.progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

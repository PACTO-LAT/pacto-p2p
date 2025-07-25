import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TradeTypeBadgeProps {
  type: 'buy' | 'sell';
  className?: string;
}

export function TradeTypeBadge({ type, className }: TradeTypeBadgeProps) {
  return (
    <Badge
      className={cn(
        'text-xs font-semibold px-3 py-1',
        type === 'sell'
          ? 'glass-effect text-white border-white/30'
          : 'glass-effect text-white border-white/30',
        className
      )}
    >
      {type === 'sell' ? 'VENDER' : 'COMPRAR'}
    </Badge>
  );
}

'use client';

import { cn } from '@/lib/utils';

interface OnlineStatusDotProps {
  online: boolean;
  className?: string;
}

export function OnlineStatusDot({ online, className }: OnlineStatusDotProps) {
  return (
    <span className={cn('flex items-center gap-1 text-xs', className)}>
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          online ? 'bg-emerald-500' : 'bg-muted-foreground/40'
        )}
      />
      <span className="text-muted-foreground">
        {online ? 'Online' : 'Offline'}
      </span>
    </span>
  );
}

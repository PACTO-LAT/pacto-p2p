'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface OnlineStatusDotProps {
  online: boolean;
  lastSeen?: Date | null;
  className?: string;
}

function formatLastSeen(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Active just now';
  if (minutes === 1) return 'Active 1 min ago';
  if (minutes < 60) return `Active ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'Active 1 hour ago';
  if (hours < 24) return `Active ${hours} hours ago`;
  return 'Active recently';
}

export function OnlineStatusDot({
  online,
  lastSeen,
  className,
}: OnlineStatusDotProps) {
  // Re-render every minute so the relative time stays fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    if (online || !lastSeen) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [online, lastSeen]);

  const label = online
    ? 'Online'
    : lastSeen
      ? formatLastSeen(lastSeen)
      : 'Offline';

  return (
    <span className={cn('flex items-center gap-1 text-xs', className)}>
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          online ? 'bg-emerald-500' : 'bg-muted-foreground/40'
        )}
      />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getTokenLogoUrl } from '@/utils/getTrustline';

interface TokenIconProps {
  token: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-lg',
};

const fallbackColor: Record<string, string> = {
  USDC: 'bg-blue-600',
  XLM: 'bg-slate-500',
};

export function TokenIcon({ token, size = 'md', className }: TokenIconProps) {
  const symbol = token.toUpperCase();
  const logoUrl = getTokenLogoUrl(symbol);
  const [imgError, setImgError] = useState(false);

  const bg = fallbackColor[symbol] ?? 'bg-emerald-600';

  if (logoUrl && !imgError) {
    return (
      <img
        src={logoUrl}
        alt={symbol}
        onError={() => setImgError(true)}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white',
        bg,
        sizeClasses[size],
        className
      )}
    >
      {symbol.slice(0, 2)}
    </div>
  );
}

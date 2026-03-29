'use client';

import Link from 'next/link';
import { ShieldOff, ArrowUpRight } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-12 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center">
        <ShieldOff className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white mb-1">No orders found</h3>
        <p className="text-xs text-muted-foreground/60">
          You don&apos;t have any active escrow contracts yet.
        </p>
      </div>
      <Link
        href="/dashboard/listings"
        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        Browse listings <ArrowUpRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

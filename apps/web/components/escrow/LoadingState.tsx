'use client';

import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5 animate-pulse"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-8 h-8 rounded-lg bg-white/[0.06]" />
              <div className="space-y-2">
                <div className="h-6 w-32 rounded bg-white/[0.06]" />
                <div className="h-3 w-48 rounded bg-white/[0.04]" />
              </div>
            </div>
            <div className="h-6 w-20 rounded-full bg-white/[0.06]" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-12 rounded-lg bg-white/[0.04]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

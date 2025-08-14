'use client';

import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading escrows...</span>
        </div>
      </div>
  );
}

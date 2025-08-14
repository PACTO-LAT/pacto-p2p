'use client';

import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  error: Error | unknown;
}

export function ErrorState({ error }: ErrorStateProps) {
  return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error loading escrows
          </h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
  );
}

'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <AlertTriangle
          className="mx-auto mb-4 h-12 w-12 text-destructive"
          aria-hidden
        />
        <h1 className="mb-2 text-xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

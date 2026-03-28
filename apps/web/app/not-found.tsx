import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <FileQuestion
          className="mx-auto mb-4 h-12 w-12 text-muted-foreground"
          aria-hidden
        />
        <h1 className="mb-2 text-xl font-semibold text-foreground">
          Page not found
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

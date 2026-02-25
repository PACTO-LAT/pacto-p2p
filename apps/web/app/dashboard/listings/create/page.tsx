'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CreateListingModal } from '@/components/merchant/CreateListingModal';

export default function CreateListingPage() {
  const router = useRouter();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      router.push('/dashboard/listings');
    }
  };

  const handleSuccess = () => {
    router.push('/dashboard/listings');
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/listings">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Listing</h1>
            <p className="text-muted-foreground">
              Create a new OTC trade listing
            </p>
          </div>
        </div>
      </div>

      <CreateListingModal
        open={true}
        onOpenChange={handleOpenChange}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useMeMerchant, usePublicMerchants } from '@/hooks/useMerchant';

export default function MerchantsPage() {
  const { data: merchants, isLoading, isError, error } = usePublicMerchants();
  const me = useMeMerchant();
  const skeletonKeys = ['s1', 's2', 's3', 's4', 's5', 's6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Merchants</h1>
        {me.data ? (
          <div className="flex gap-2">
            <Link href="/dashboard/merchant">
              <Button variant="outline">My Merchant</Button>
            </Link>
          </div>
        ) : (
          <Link href="/dashboard/merchant">
            <Button>Become a Merchant</Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skeletonKeys.map((key) => (
            <Card key={key} className="feature-card rounded-2xl p-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <div className="mt-3 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="font-medium text-foreground">Failed to load merchants</p>
            <p className="text-sm">{error instanceof Error ? error.message : 'Something went wrong.'}</p>
          </div>
        </div>
      ) : merchants && merchants.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border py-12 text-center">
          <p className="text-sm text-muted-foreground">No merchants found yet.</p>
          <Link href="/dashboard/merchant">
            <Button>Create your merchant profile</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {merchants?.map((m) => (
            <Link
              key={m.id}
              href={`/m/${m.slug}`}
              aria-label={`Open merchant profile for ${m.display_name}`}
            >
              <Card className="feature-card rounded-2xl p-4">
                <div className="relative h-24 w-full overflow-hidden rounded-xl">
                  <Image
                    src={m.banner_url || '/window.svg'}
                    alt={`Banner for ${m.display_name}`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                    priority={false}
                  />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl border">
                    {m.avatar_url ? (
                      <Image
                        src={m.avatar_url}
                        alt={m.display_name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{m.display_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.location || '—'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.rating || 'No rating'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.verification_status || 'No verification status'}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

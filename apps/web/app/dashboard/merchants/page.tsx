'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMeMerchant, usePublicMerchants } from '@/hooks/useMerchant';

export default function MerchantsPage() {
  const { data: merchants } = usePublicMerchants();
  const me = useMeMerchant();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Merchants</h1>
          {me.data ? (
            <div className="flex gap-2">
              <Link href="/merchant">
                <Button variant="outline">My Merchant</Button>
              </Link>
            </div>
          ) : (
            <Link href="/merchant">
              <Button>Become a Merchant</Button>
            </Link>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {merchants?.map((m) => (
            <Link key={m.id} href={`/m/${m.slug}`}>
              <Card className="rounded-2xl p-4 hover:bg-accent/30 transition">
                <div className="relative h-24 w-full overflow-hidden rounded-xl">
                  <Image
                    src={m.banner_url || '/window.svg'}
                    alt="banner"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl border">
                    {m.avatar_url ? (
                      <Image
                        src={m.avatar_url}
                        alt={m.display_name}
                        fill
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
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

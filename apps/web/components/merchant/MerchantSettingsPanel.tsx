'use client';

import Image from 'next/image';
import { MerchantProfileForm } from '@/components/merchant/MerchantProfileForm';
import { Card } from '@/components/ui/card';
import { useMeMerchant } from '@/hooks/useMerchant';

export function MerchantSettingsPanel() {
  const me = useMeMerchant();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <div className="mb-2 text-lg font-semibold">Profile Settings</div>
        <MerchantProfileForm initial={me.data ?? undefined} />
      </div>
      <div>
        <div className="mb-2 text-lg font-semibold">Live Preview</div>
        <Card className="feature-card-dark rounded-2xl p-4">
          <div className="relative h-32 w-full overflow-hidden rounded-xl">
            <Image
              src={me.data?.banner_url || '/window.svg'}
              alt="banner"
              fill
              className="object-cover"
            />
          </div>
          <div className="-mt-8 flex items-end gap-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl border">
              {me.data?.avatar_url ? (
                <Image
                  src={me.data.avatar_url}
                  alt="avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </div>
            <div>
              <div className="text-base font-semibold">
                {me.data?.display_name || '—'}
              </div>
              <div className="text-xs text-muted-foreground">
                /{me.data?.slug || 'your-slug'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

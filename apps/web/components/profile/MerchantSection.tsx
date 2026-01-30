'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MerchantApplicationModal } from '@/components/merchant/MerchantApplicationModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useMeMerchant } from '@/hooks/useMerchant';

export function MerchantSection() {
  const me = useMeMerchant();
  const [open, setOpen] = useState(false);
  const merchant = me.data ?? null;

  return (
    <Card className="feature-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          Merchant
        </CardTitle>
        <CardDescription>
          Manage your merchant profile, or become a merchant to list offers.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        {merchant ? (
          <>
            <Link href="/dashboard/merchant">
              <Button variant="default" className="text-accent">
                Merchant Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/merchants">
              <Button variant="outline">Browse Merchants</Button>
            </Link>
            {merchant.verification_status === 'pending' ? (
              <Badge variant="secondary">Application Pending</Badge>
            ) : null}
            {merchant.verification_status === 'rejected' ? (
              <Badge variant="destructive">Application Rejected</Badge>
            ) : null}
            {merchant.verification_status === 'revoked' ? (
              <Badge variant="destructive">Access Revoked</Badge>
            ) : null}
          </>
        ) : (
          <>
            <Button
              variant="default"
              className="text-accent"
              onClick={() => setOpen(true)}
              disabled={me.isLoading}
            >
              {me.isLoading ? 'Loading...' : 'Apply to Become a Merchant'}
            </Button>
            <Link href="/dashboard/merchants">
              <Button variant="outline">Browse Merchants</Button>
            </Link>
          </>
        )}
      </CardContent>
      <MerchantApplicationModal open={open} onOpenChange={setOpen} />
    </Card>
  );
}

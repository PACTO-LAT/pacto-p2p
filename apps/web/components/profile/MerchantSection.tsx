'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function MerchantSection() {
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
      <CardContent className="flex flex-wrap gap-3">
        <Link href="/dashboard/merchant">
          <Button variant="default" className="text-accent">
            Merchant Dashboard
          </Button>
        </Link>
        <Link href="/dashboard/merchants">
          <Button variant="outline">Browse Merchants</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

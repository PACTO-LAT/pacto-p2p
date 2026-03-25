'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMeMerchant } from '@/hooks/useMerchant';
import { MerchantApplicationModal } from '@/components/merchant/MerchantApplicationModal';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function MerchantSection() {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const { data: merchant, isLoading, refetch } = useMeMerchant();

  const handleApplicationSuccess = () => {
    refetch();
  };

  const getStatusDisplay = () => {
    if (!merchant) return null;

    const statusConfig = {
      pending: {
        icon: Clock,
        label: 'Application Pending',
        variant: 'secondary' as const,
        description: 'Your merchant application is being reviewed',
      },
      verified: {
        icon: CheckCircle,
        label: 'Verified Merchant',
        variant: 'default' as const,
        description: 'You are a verified merchant',
      },
      rejected: {
        icon: XCircle,
        label: 'Application Rejected',
        variant: 'destructive' as const,
        description: 'Your merchant application was rejected',
      },
      revoked: {
        icon: AlertTriangle,
        label: 'Merchant Status Revoked',
        variant: 'destructive' as const,
        description: 'Your merchant status has been revoked',
      },
    };

    const config = statusConfig[merchant.verification_status];
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2 mb-4">
        <Badge variant={config.variant} className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {config.description}
        </span>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Loading merchant status...
          </div>
        </CardContent>
      );
    }

    if (!merchant) {
      // No merchant profile - show application option
      return (
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Become a merchant to list your own trading offers and earn from P2P
            trading.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowApplicationModal(true)}
              className="text-accent"
            >
              Apply to Become a Merchant
            </Button>
            <Link href="/dashboard/merchants">
              <Button variant="outline">Browse Merchants</Button>
            </Link>
          </div>
        </CardContent>
      );
    }

    // Has merchant profile - show status and actions
    return (
      <CardContent className="space-y-4">
        {getStatusDisplay()}
        <div className="flex flex-wrap gap-3">
          {merchant.verification_status === 'verified' && (
            <Link href="/dashboard/merchant">
              <Button variant="default" className="text-accent">
                Merchant Dashboard
              </Button>
            </Link>
          )}
          {merchant.verification_status === 'rejected' && (
            <Button
              onClick={() => setShowApplicationModal(true)}
              variant="default"
            >
              Reapply as Merchant
            </Button>
          )}
          <Link href="/dashboard/merchants">
            <Button variant="outline">Browse Merchants</Button>
          </Link>
        </div>
      </CardContent>
    );
  };

  return (
    <>
      <Card className="feature-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            Merchant
          </CardTitle>
          <CardDescription>
            Manage your merchant profile, or become a merchant to list offers.
          </CardDescription>
        </CardHeader>
        {renderContent()}
      </Card>

      <MerchantApplicationModal
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
        onSuccess={handleApplicationSuccess}
      />
    </>
  );
}

import Link from 'next/link';
import React from 'react';
import { useMerchantStatus } from '../../hooks/useMerchant';

interface MerchantGuardProps {
  children: React.ReactNode;
}

export function MerchantGuard({ children }: MerchantGuardProps) {
  const {
    isLoading,
    hasMerchantProfile,
    isVerifiedMerchant,
    verificationStatus,
  } = useMerchantStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-gray-500">Checking merchant status...</span>
      </div>
    );
  }

  if (!hasMerchantProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="mb-4 text-center text-lg text-gray-700">
          You need a merchant profile to access this feature.
        </p>
        <Link
          href="/dashboard/merchant"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create Merchant Profile
        </Link>
      </div>
    );
  }

  if (!isVerifiedMerchant) {
    const messages: Record<string, string> = {
      pending: 'Your merchant application is under review.',
      rejected: 'Your merchant application was rejected.',
      revoked: 'Your merchant access has been revoked.',
    };
    const message =
      messages[verificationStatus ?? ''] ??
      'Your merchant account is not verified.';

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-center text-lg text-gray-700">{message}</p>
      </div>
    );
  }

  return <>{children}</>;
}

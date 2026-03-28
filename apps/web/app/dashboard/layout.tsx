'use client';

import dynamic from 'next/dynamic';
import type React from 'react';
import { TradeNotificationsProvider } from '@/providers/trade-notifications.provider';

// Load header only on client to avoid Radix UI hydration mismatch (auto-generated IDs differ between SSR and client)
const DashboardHeader = dynamic(
  () =>
    import('@/components/layout/dashboard-header').then((m) => ({
      default: m.DashboardHeader,
    })),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TradeNotificationsProvider>
      <div className="min-h-screen flex flex-col">
        <div className="h-16 shrink-0">
          <DashboardHeader />
        </div>
        <main className="flex-1 p-4 pt-12 sm:p-5 sm:pt-14 md:p-6 md:pt-16 lg:p-8 lg:pt-20 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </TradeNotificationsProvider>
  );
}

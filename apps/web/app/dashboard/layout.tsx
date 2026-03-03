'use client';

import dynamic from 'next/dynamic';
import type React from 'react';

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
    <div className="min-h-screen flex flex-col">
      <div className="h-16 shrink-0">
        <DashboardHeader />
      </div>
      <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

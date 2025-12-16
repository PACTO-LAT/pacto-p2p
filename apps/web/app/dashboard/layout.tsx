'use client';

import type React from 'react';
import { DashboardHeader } from '@/components/layout/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 sm:p-5 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

'use client';

import type React from 'react';
import { AppHeader } from '@/components/layout/app-header';
 
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}

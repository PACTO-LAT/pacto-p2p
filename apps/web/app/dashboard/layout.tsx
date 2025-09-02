'use client';

import type React from 'react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="sticky top-0 z-40 glass-effect backdrop-blur-md border-b border-glass-border lg:hidden px-4 py-2">
          <SidebarTrigger />
        </div>
        <main className="p-6 lg:p-8 min-h-screen">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

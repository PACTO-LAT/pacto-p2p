'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  DisputeManagement,
  MerchantApplications,
  PlatformStats,
  UserManagement,
} from '@/components/admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlatformStats } from '@/hooks/use-admin';
import { useAuth } from '@/hooks/use-auth';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const { data: platformStats } = usePlatformStats();

  useEffect(() => {
    if (!loading && user?.user_type !== 'admin') {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user?.user_type !== 'admin') return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600">
            Manage stablecoins and platform operations
          </p>
        </div>
      </div>

      {/* Platform Stats */}
      <PlatformStats
        stats={
          platformStats ?? {
            totalUsers: 0,
            activeListings: 0,
            totalVolume: 0,
            completedTrades: 0,
          }
        }
      />

      {/* Main Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="inline-flex flex-wrap h-auto p-1 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/50 gap-1">
          <TabsTrigger
            value="users"
            className="bg-card/60 hover:bg-card/80 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-md px-4 py-1.5 text-sm font-medium border border-transparent cursor-pointer whitespace-nowrap"
          >
            User Management
          </TabsTrigger>
          <TabsTrigger
            value="merchant-applications"
            className="bg-card/60 hover:bg-card/80 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-md px-4 py-1.5 text-sm font-medium border border-transparent cursor-pointer whitespace-nowrap"
          >
            Merchant Applications
          </TabsTrigger>
          <TabsTrigger
            value="disputes"
            className="bg-card/60 hover:bg-card/80 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-md px-4 py-1.5 text-sm font-medium border border-transparent cursor-pointer whitespace-nowrap"
          >
            Disputes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="merchant-applications">
          <MerchantApplications />
        </TabsContent>

        <TabsContent value="disputes">
          <DisputeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

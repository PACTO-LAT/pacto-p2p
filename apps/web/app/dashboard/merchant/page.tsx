'use client';

import Link from 'next/link';
import { BadgeGrid } from '@/components/merchant/BadgeGrid';
import { CreateListingForm } from '@/components/merchant/CreateListingForm';
import { KpiCards } from '@/components/merchant/KpiCards';
import { ListingsTable } from '@/components/merchant/ListingsTable';
import { MerchantHero } from '@/components/merchant/MerchantHero';
import { MerchantProfileForm } from '@/components/merchant/MerchantProfileForm';
import { MerchantSettingsPanel } from '@/components/merchant/MerchantSettingsPanel';
import { SpeedHistogram } from '@/components/merchant/SpeedHistogram';
import { VolumeChart } from '@/components/merchant/VolumeChart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useMeMerchant,
  useMerchantBadges,
  useMerchantKpis,
  useMerchantSpeed,
  useMerchantVolume,
  useMyListings,
} from '@/hooks/useMerchant';

export default function MerchantDashboardPage() {
  const me = useMeMerchant();
  const listings = useMyListings();

  if (me.data === null) {
    return (
      <div className="mx-auto space-y-8 p-4 sm:p-6">
        <Card className="glass-card bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-4 sm:p-6">
          <div className="mb-2 text-3xl font-bold text-foreground">
            Create Merchant Profile
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Set up your merchant presence to start posting listings.
          </p>
          <MerchantProfileForm />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-8 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="text-4xl font-bold text-foreground">Merchant</div>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/merchants">
            <Button variant="ghost" size="sm">
              Browse Merchants
            </Button>
          </Link>
          {me.data && (
            <Link href={`/m/${me.data.slug}`}>
              <Button variant="outline" size="sm">
                View Public Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass-card bg-white/80 backdrop-blur-sm border border-white/30 p-1 grid w-full grid-cols-4">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="create"
            className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            Create Listing
          </TabsTrigger>
          <TabsTrigger
            value="listings"
            className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            My Listings
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {me.data ? (
            <section className="space-y-4">
              <MerchantHero merchant={me.data} />
              <OverviewReports merchantId={me.data.id} />
            </section>
          ) : null}
        </TabsContent>

        <TabsContent value="create" className="space-y-3">
          <div className="text-sm font-medium">Create Listing</div>
          <CreateListingForm />
        </TabsContent>

        <TabsContent value="listings" className="space-y-3">
          <div className="text-sm font-medium">My Listings</div>
          <ListingsTable listings={listings.data || []} ctaLabel="View" />
        </TabsContent>

        <TabsContent value="settings" className="space-y-3">
          <MerchantSettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewReports({ merchantId }: { merchantId: string }) {
  const { data: kpis } = useMerchantKpis(merchantId);
  const { data: badges } = useMerchantBadges(merchantId);
  const { data: volume } = useMerchantVolume(merchantId);
  const { data: speed } = useMerchantSpeed(merchantId);

  return (
    <div className="space-y-6">
      {kpis ? <KpiCards kpis={kpis} /> : null}
      {badges?.length ? (
        <section className="space-y-3">
          <div className="text-sm font-medium">Badges</div>
          <BadgeGrid badges={badges} />
        </section>
      ) : null}
      <section className="grid gap-4 lg:grid-cols-2">
        {volume ? <VolumeChart data={volume} /> : null}
        {speed ? <SpeedHistogram data={speed} /> : null}
      </section>
    </div>
  );
}

import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BadgeGrid } from '@/components/merchant/BadgeGrid';
import { KpiCards } from '@/components/merchant/KpiCards';
import { ListingsTable } from '@/components/merchant/ListingsTable';
import { MerchantHero } from '@/components/merchant/MerchantHero';
import { SpeedHistogram } from '@/components/merchant/SpeedHistogram';
import { VolumeChart } from '@/components/merchant/VolumeChart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { merchantAdapter } from '@/lib/adapters';
import { backendFetch } from '@/lib/services/backend';
import type {
  MerchantBadge,
  MerchantKpis,
  MerchantListing,
  SpeedBucket,
  VolumePoint,
} from '@/lib/types/merchant';
import {
  BadgesGridSkeleton,
  KpiCardsSkeleton,
  ListingsTableSkeleton,
  MerchantHeroSkeleton,
  SpeedHistogramSkeleton,
  VolumeChartSkeleton,
} from '@/app/m/[slug]/_components/MerchantSkeletons';

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const merchant = await merchantAdapter.getPublicMerchantBySlug(slug);
  if (!merchant || !merchant.is_public) return notFound();

  // Core stats from the backend (best-effort). Falls back to the merchant row
  // values already loaded, with 0 for completion/dispute on failure.
  let coreStats: CoreStats = {
    rating: merchant.rating,
    total_trades: merchant.total_trades,
    volume_traded: merchant.volume_traded,
    completion_rate: 0,
    dispute_rate: 0,
  };
  try {
    const res = await backendFetch(`/v1/merchants/${merchant.id}/stats`);
    if (res.ok) {
      coreStats = (await res.json()) as CoreStats;
    }
  } catch {
    // best-effort: fall back to the merchant row values already loaded
  }

  const kpisPromise = merchantAdapter.getKpis(merchant.id);
  const badgesPromise = merchantAdapter.getBadges(merchant.id);
  const volumePromise = merchantAdapter.getVolumeSeries(merchant.id);
  const speedPromise = merchantAdapter.getSpeedHistogram(merchant.id);
  const listingsPromise = merchantAdapter.getActiveListings(merchant.id);

  return (
    <div className="bg-emerald-pattern hero-section">
      <div className="hero-glow" />
      <div className="hero-grid" />
      <div className="hero-shape hero-shape-1" />
      <div className="hero-shape hero-shape-2" />
      <div className="hero-shape hero-shape-3" />
      <div className="container mx-auto max-w-6xl space-y-6 p-4 sm:p-6 relative z-10">
        <div className="flex items-center">
          <Link href="/dashboard/merchants">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Merchants
            </Button>
          </Link>
        </div>
        <Suspense fallback={<MerchantHeroSkeleton />}>
          {/* Merchant hero depends only on the already-fetched merchant */}
          <MerchantHero merchant={merchant} />
        </Suspense>

        <section className="space-y-3">
          <Suspense fallback={<KpiCardsSkeleton />}>
            <KpisSection promise={kpisPromise} coreStats={coreStats} />
          </Suspense>
          <Card className="rounded-2xl p-4">
            <div className="text-xs text-muted-foreground">
              Last refreshed just now
            </div>
          </Card>
        </section>

        {merchant.bio ? (
          <section>
            <Card className="rounded-2xl p-4">
              <div className="text-sm font-medium">About</div>
              <p className="mt-2 text-sm text-muted-foreground">
                {merchant.bio}
              </p>
            </Card>
          </section>
        ) : null}

        <section className="space-y-3">
          <div className="text-sm font-medium">Badges</div>
          <Suspense fallback={<BadgesGridSkeleton />}>
            <BadgesSection promise={badgesPromise} />
          </Suspense>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Suspense fallback={<VolumeChartSkeleton />}>
            <VolumeSection promise={volumePromise} />
          </Suspense>
          <Suspense fallback={<SpeedHistogramSkeleton />}>
            <SpeedSection promise={speedPromise} />
          </Suspense>
        </section>

        <section className="space-y-3">
          <div className="text-sm font-medium">Listings</div>
          <Suspense fallback={<ListingsTableSkeleton />}>
            <ListingsSection promise={listingsPromise} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

type CoreStats = {
  rating: number;
  total_trades: number;
  volume_traded: number;
  completion_rate: number;
  dispute_rate: number;
};

async function KpisSection({
  promise,
  coreStats,
}: {
  promise: Promise<MerchantKpis>;
  coreStats: CoreStats;
}) {
  const kpis = await promise;
  // Core figures (total trades, completion %, dispute %) come from the backend.
  // 30d volume + median release time still come from the client-side adapter.
  const mergedKpis: MerchantKpis = {
    ...kpis,
    total_trades: coreStats.total_trades,
    completion_rate_pct: coreStats.completion_rate,
    dispute_rate_pct: coreStats.dispute_rate,
  };
  return <KpiCards kpis={mergedKpis} />;
}

async function BadgesSection({
  promise,
}: {
  promise: Promise<MerchantBadge[]>;
}) {
  const badges = await promise;
  if (!badges.length) return null;
  return <BadgeGrid badges={badges} />;
}

async function VolumeSection({ promise }: { promise: Promise<VolumePoint[]> }) {
  const volume = await promise;
  return <VolumeChart data={volume} />;
}

async function SpeedSection({ promise }: { promise: Promise<SpeedBucket[]> }) {
  const speed = await promise;
  return <SpeedHistogram data={speed} />;
}

async function ListingsSection({
  promise,
}: {
  promise: Promise<MerchantListing[]>;
}) {
  const listings = await promise;
  return <ListingsTable listings={listings} showStatus={false} />;
}

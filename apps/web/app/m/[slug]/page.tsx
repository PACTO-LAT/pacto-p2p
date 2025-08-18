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

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const merchant = await merchantAdapter.getPublicMerchantBySlug(slug);
  if (!merchant || !merchant.is_public) return notFound();

  const [kpis, badges, volume, speed, listings] = await Promise.all([
    merchantAdapter.getKpis(merchant.id),
    merchantAdapter.getBadges(merchant.id),
    merchantAdapter.getVolumeSeries(merchant.id),
    merchantAdapter.getSpeedHistogram(merchant.id),
    merchantAdapter.getActiveListings(merchant.id),
  ]);

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/merchants">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Merchants
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Open Pacto Dashboard
          </Button>
        </Link>
      </div>
      <MerchantHero merchant={merchant} />

      <section className="space-y-3">
        <KpiCards kpis={kpis} />
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
            <p className="mt-2 text-sm text-muted-foreground">{merchant.bio}</p>
          </Card>
        </section>
      ) : null}

      {badges.length ? (
        <section className="space-y-3">
          <div className="text-sm font-medium">Badges</div>
          <BadgeGrid badges={badges} />
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <VolumeChart data={volume} />
        <SpeedHistogram data={speed} />
      </section>

      <section className="space-y-3">
        <div className="text-sm font-medium">Listings</div>
        <ListingsTable listings={listings} showStatus={false} />
      </section>
    </div>
  );
}

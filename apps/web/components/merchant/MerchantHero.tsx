'use client';

import { motion } from 'framer-motion';
import { Globe, MapPin, ShieldCheck, ShieldX, Timer, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Merchant } from '@/lib/types/merchant';

function StatusPill({ status }: { status: Merchant['verification_status'] }) {
  const map: Record<
    Merchant['verification_status'],
    { label: string; className: string; icon: React.ReactNode }
  > = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-500/10 text-yellow-400',
      icon: <Timer className="h-3.5 w-3.5" />,
    },
    verified: {
      label: 'Verified',
      className: 'bg-emerald-500/10 text-emerald-400',
      icon: <ShieldCheck className="h-3.5 w-3.5" />,
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-500/10 text-red-400',
      icon: <ShieldX className="h-3.5 w-3.5" />,
    },
    revoked: {
      label: 'Revoked',
      className: 'bg-zinc-500/10 text-zinc-400',
      icon: <ShieldX className="h-3.5 w-3.5" />,
    },
  };
  const cfg = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export function MerchantHero({ merchant }: { merchant: Merchant }) {
  return (
    <section className="w-full">
      <div className="relative h-44 w-full rounded-2xl overflow-hidden sm:h-64 lg:h-72">
        <Image
          src={merchant.banner_url || '/window.svg'}
          alt="banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/80" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="feature-card -mt-12 sm:-mt-16 rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border ring-2 ring-background ring-offset-2 ring-offset-background">
              {merchant.avatar_url ? (
                <Image
                  src={merchant.avatar_url}
                  alt={merchant.display_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold sm:text-3xl text-hero-gradient">
                  {merchant.display_name}
                </h1>
                <StatusPill status={merchant.verification_status} />
                {merchant.is_public ? (
                  <Badge variant="secondary">Public</Badge>
                ) : (
                  <Badge variant="outline">Private</Badge>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {merchant.location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1">
                    <MapPin className="h-4 w-4" />
                    {merchant.location}
                  </span>
                )}
                {merchant.languages?.length ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1">
                    {merchant.languages.join(', ')}
                  </span>
                ) : null}
                {merchant.socials?.website && (
                  <Link href={merchant.socials.website} target="_blank" className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 hover:text-foreground">
                    <Globe className="h-4 w-4" /> Website
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

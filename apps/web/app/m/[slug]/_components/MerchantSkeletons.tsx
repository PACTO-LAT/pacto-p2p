"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MerchantHeroSkeleton() {
  return (
    <section className="w-full">
      <div className="relative h-40 w-full rounded-2xl overflow-hidden sm:h-56">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
      <Card className="feature-card -mt-10 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Skeleton className="h-20 w-20 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-56" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {[0, 1, 2, 3, 4].map((k) => (
        <Card key={k} className="feature-card rounded-2xl p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-5 w-24" />
        </Card>
      ))}
    </div>
  );
}

export function BadgesGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {[0, 1, 2, 3].map((k) => (
        <Card key={k} className="feature-card rounded-2xl p-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-20" />
        </Card>
      ))}
    </div>
  );
}

export function VolumeChartSkeleton() {
  return (
    <Card className="feature-card rounded-2xl p-4">
      <Skeleton className="mb-3 h-4 w-28" />
      <Skeleton className="h-56 w-full" />
    </Card>
  );
}

export function SpeedHistogramSkeleton() {
  return (
    <Card className="feature-card rounded-2xl p-4">
      <Skeleton className="mb-3 h-4 w-36" />
      <Skeleton className="h-56 w-full" />
    </Card>
  );
}

export function ListingsTableSkeleton() {
  return (
    <Card className="feature-card rounded-2xl p-0">
      <div className="overflow-x-auto">
        <div className="p-4 space-y-3">
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} className="grid grid-cols-7 items-center gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-20 rounded-md justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}



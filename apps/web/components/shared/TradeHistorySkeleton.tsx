import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TradeHistorySkeleton() {
  return (
    <div className="grid gap-4 sm:gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="card">
          <CardContent className="p-0">
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-4">
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="flex flex-col items-center flex-shrink-0 gap-2">
                    <Skeleton className="h-8 w-16 rounded-full" />
                    <Skeleton className="h-12 w-12 rounded-xl" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-baseline gap-2">
                      <Skeleton className="h-7 w-24" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:items-end">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </div>
              <div className="border-t border-border/50 pt-3 sm:pt-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

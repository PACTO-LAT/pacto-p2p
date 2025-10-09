'use client';

import { ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MerchantListing } from '@/lib/types/merchant';

type SortKey = keyof Pick<
  MerchantListing,
  'side' | 'asset_code' | 'price_rate' | 'amount' | 'created_at' | 'status'
>;

export function ListingsTable({
  listings,
  ctaLabel = 'Trade',
  showStatus = true,
}: {
  listings: MerchantListing[];
  ctaLabel?: string;
  showStatus?: boolean;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [asc, setAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...listings].sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      const dir = asc ? 1 : -1;
      if (typeof av === 'number' && typeof bv === 'number')
        return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [listings, sortKey, asc]);

  function onSort(k: SortKey) {
    if (k === sortKey) setAsc((v) => !v);
    else {
      setSortKey(k);
      setAsc(false);
    }
  }

  return (
    <Card className="rounded-2xl p-0 bg-gradient-to-b from-background to-muted/40 border border-border/50">
      {/* Mobile Cards */}
      <div className="grid gap-3 p-3 sm:hidden">
        {sorted.map((l) => (
          <div key={l.id} className="rounded-xl border p-4 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium capitalize">
                {l.side}
                <span className="mx-2 text-muted-foreground">•</span>
                <span className="text-muted-foreground">{l.asset_code}</span>
              </div>
              <Button size="sm" className="btn-secondary" type="button">
                {ctaLabel}
              </Button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Asset</div>
                <div>{l.asset_code}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Price</div>
                <div>
                  {l.price_rate} {l.quote_currency}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div>{l.amount.toLocaleString()}</div>
              </div>
              {showStatus ? (
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div>
                    <Badge variant={l.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                      {l.status}
                    </Badge>
                  </div>
                </div>
              ) : null}
              <div className="col-span-2">
                <div className="text-muted-foreground">Min–Max</div>
                <div>
                  {l.min_amount ? l.min_amount.toLocaleString() : '—'} –{' '}
                  {l.max_amount ? l.max_amount.toLocaleString() : '—'}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground">Payment Methods</div>
                {l.payment_methods?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {l.payment_methods.map((pm) => (
                      <Badge key={pm.method} variant="outline" className="text-[11px]">
                        {pm.method}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div>—</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm">
          <thead className="text-left sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <tr className="border-b">
              {(
                [
                  ['side', 'Side'],
                  ['asset_code', 'Asset'],
                  ['price_rate', 'Price'],
                  ['amount', 'Amount'],
                  ['created_at', 'Created'],
                  ['minmax', 'Min–Max'],
                  ['payments', 'Payment Methods'],
                  ...(showStatus ? ([['status', 'Status']] as const) : []),
                ] as const
              ).map(([k, label]) => (
                <th key={k} className="px-4 py-3 font-medium">
                  {(['status', 'minmax', 'payments'] as const).includes(
                    k as 'status' | 'minmax' | 'payments'
                  ) ? (
                    <span className="inline-flex items-center gap-1">
                      {label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => onSort(k as SortKey)}
                    >
                      {label}
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  )}
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((l) => (
              <tr
                key={l.id}
                className="border-b/50 transition-colors hover:bg-emerald-500/5"
              >
                <td className="px-4 py-3 font-medium capitalize whitespace-nowrap">{l.side}</td>
                <td className="px-4 py-3 whitespace-nowrap">{l.asset_code}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {l.price_rate} {l.quote_currency}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{l.amount.toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(l.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {l.min_amount ? l.min_amount.toLocaleString() : '—'} –{' '}
                  {l.max_amount ? l.max_amount.toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3">
                  {l.payment_methods?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {l.payment_methods.map((pm) => (
                        <Badge key={pm.method} variant="outline" className="text-[11px]">
                          {pm.method}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                {showStatus ? (
                  <td className="px-4 py-3">
                    <Badge variant={l.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                      {l.status}
                    </Badge>
                  </td>
                ) : null}
                <td className="px-4 py-3 text-right">
                  <Button size="sm" className="btn-secondary" type="button">
                    {ctaLabel}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

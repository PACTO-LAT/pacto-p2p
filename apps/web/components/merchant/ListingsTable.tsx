'use client';

import { ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <Card className="feature-card-dark rounded-2xl p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left">
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
                      className="inline-flex items-center gap-1"
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
              <tr key={l.id} className="border-b/50">
                <td className="px-4 py-3 font-medium capitalize">{l.side}</td>
                <td className="px-4 py-3">{l.asset_code}</td>
                <td className="px-4 py-3">
                  {l.price_rate} {l.quote_currency}
                </td>
                <td className="px-4 py-3">{l.amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {new Date(l.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {l.min_amount ? l.min_amount.toLocaleString() : '—'} –{' '}
                  {l.max_amount ? l.max_amount.toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3">
                  {l.payment_methods?.length
                    ? l.payment_methods.map((pm) => pm.method).join(', ')
                    : '—'}
                </td>
                {showStatus ? (
                  <td className="px-4 py-3 capitalize">{l.status}</td>
                ) : null}
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="default" type="button">
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

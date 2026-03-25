'use client';

import { Button } from '@/components/ui/button';

interface MerchantApplicationFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'revoked', label: 'Revoked' },
];

export function MerchantApplicationFilters({
  activeFilter,
  onFilterChange,
}: MerchantApplicationFiltersProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant="outline"
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          aria-pressed={activeFilter === filter.value}
          aria-label={`Filter by ${filter.label} status`}
          className={
            activeFilter === filter.value
              ? 'btn-emerald border-emerald-500'
              : ''
          }
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

'use client';

import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListingFilters } from '@/lib/types/marketplace';

interface MarketplaceFiltersProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
}

export function MarketplaceFilters({
  filters,
  onFiltersChange,
}: MarketplaceFiltersProps) {
  const handleSearchChange = (searchTerm: string) => {
    onFiltersChange({ ...filters, searchTerm });
  };

  const handleTokenChange = (selectedToken: string) => {
    onFiltersChange({ ...filters, selectedToken });
  };

  const handleTypeChange = (selectedType: string) => {
    onFiltersChange({ ...filters, selectedType });
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by token or currency..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/[0.04] border border-white/[0.07] text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-white/[0.15] transition-colors"
          />
        </div>
        <Select
          value={filters.selectedToken}
          onValueChange={handleTokenChange}
        >
          <SelectTrigger className="w-full sm:w-40 h-9 bg-white/[0.04] border-white/[0.07] text-sm">
            <SelectValue placeholder="Token" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tokens</SelectItem>
            <SelectItem value="CRCX">CRCX</SelectItem>
            <SelectItem value="MXNX">MXNX</SelectItem>
            <SelectItem value="USDC">USDC</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-full sm:w-40 h-9 bg-white/[0.04] border-white/[0.07] text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="buy">Buy Orders</SelectItem>
            <SelectItem value="sell">Sell Orders</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

'use client';

import { Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by token or currency..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 input-glass"
              />
            </div>
          </div>
          <Select
            value={filters.selectedToken}
            onValueChange={handleTokenChange}
          >
            <SelectTrigger className="w-full sm:w-40 input-glass">
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
            <SelectTrigger className="w-full sm:w-40 input-glass">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="buy">Buy Orders</SelectItem>
              <SelectItem value="sell">Sell Orders</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

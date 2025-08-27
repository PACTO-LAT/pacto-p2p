'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCreateEscrow } from '@/hooks/use-escrows';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import {
  ListingsTabs,
  MarketplaceFilters,
  MarketStats,
  TradeConfirmationDialog,
} from '@/components/marketplace';
import type { MarketplaceListing, ListingFilters } from '@/lib/types/marketplace';
import { filterListings, getMarketStats } from '@/lib/marketplace-utils';

export default function ListingsPage() {
  const [filters, setFilters] = useState<ListingFilters>({
    searchTerm: '',
    selectedToken: 'all',
    selectedType: 'all',
  });
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [open, setOpen] = useState(false);
  const { address } = useGlobalAuthenticationStore();

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedListing(null);
  };

  const { mutate, isPending } = useCreateEscrow(handleCloseModal);

  const [listings] = useState<MarketplaceListing[]>([
    {
      id: 1,
      type: 'sell',
      token: 'CRCX',
      amount: 5200,
      rate: 523.00,
      fiatCurrency: 'CRC',
      paymentMethod: 'SINPE Móvil, BAC Costa Rica, Transferencia Bancaria',
      seller: address,
      buyer: address,
      reputation: 4.8,
      trades: 23,
      created: '2025-01-15',
      status: 'active',
      description: 'I need to buy CRCX',
      minAmount: 100,
      maxAmount: 5200,
      terms: [
        { type: 'positive', text: 'Gracias Por Comerciar conmigo, Un placer. 💯' },
        { type: 'positive', text: 'Solo Cuentas Personales.' },
        { type: 'negative', text: 'No Acepto Pagos de Terceros' },
        { type: 'positive', text: 'Debes estar En Costa Rica para hacer el pago de Colones. Si estás en otro País, Tendrás que hacer una Verifica de Identidad. 🇨🇷' },
        { type: 'negative', text: 'No Acepto Pagos, desde Fuera de CR.' },
        { type: 'negative', text: 'NO PAGOS BCR' },
        { type: 'negative', text: 'NO PAGOS PROMERICA.' },
        { type: 'positive', text: 'Adjuntar Comprobante con Toda la Informacion Respectiva.' },
        { type: 'negative', text: 'Toda Transferencia Maliciosa, Sera Reportada al BANCO o a PACTO segun Corresponda ❌' }
      ],
    },
  ]);

  const filteredListings = filterListings(listings, filters);
  const marketStats = getMarketStats(listings);

  const handleTrade = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setOpen(true);
  };

  const confirmTrade = () => {
    if (!selectedListing) return;

    mutate({
      listing: {
        ...selectedListing,
        fiat_currency: selectedListing.fiatCurrency,
        payment_method: selectedListing.paymentMethod,
      },
      amount: selectedListing.amount,
      buyer_id: selectedListing.buyer, // todo: change it
      seller_id: selectedListing.seller,
      token: selectedListing.token,
      fiat_amount: selectedListing.amount * selectedListing.rate,
      fiat_currency: selectedListing.fiatCurrency,
    });
  };

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Marketplace</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Browse and trade Stellar stablecoins
            </p>
          </div>
          <Link href="/dashboard/listings/create">
            <Button className="btn-emerald">
              <Plus className="w-4 h-4 mr-2" />
              Create Listing
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <MarketplaceFilters filters={filters} onFiltersChange={setFilters} />

        {/* Market Stats */}
        <MarketStats stats={marketStats} />

        {/* Listings */}
        <ListingsTabs listings={filteredListings} onTrade={handleTrade} />

        {/* Trade Confirmation Dialog */}
        <TradeConfirmationDialog
          open={open}
          onOpenChange={setOpen}
          selectedListing={selectedListing}
          onConfirm={confirmTrade}
          isPending={isPending}
        />
      </div>
  );
}

"use client";

import {
  ExternalLink,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { TokenIcon } from "@/components/token-icon";
import { TradeTypeBadge } from "@/components/trade-type-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateEscrow } from "@/hooks/use-escrows";
import {
  formatAmount,
  formatCurrency,
  formatDate,
} from "@/lib/dashboard-utils";
import useGlobalAuthenticationStore from "@/store/wallet.store";

interface MarketplaceListing {
  id: number;
  type: "sell" | "buy";
  token: string;
  amount: number;
  rate: number;
  fiatCurrency: string;
  paymentMethod: string;
  seller: string;
  buyer: string;
  reputation: number;
  trades: number;
  created: string;
  status: string;
  description: string;
}

export default function ListingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedToken, setSelectedToken] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedListing, setSelectedListing] =
    useState<MarketplaceListing | null>(null);
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
      type: "sell",
      token: "CRCX",
      amount: 5000,
      rate: 1.05,
      fiatCurrency: "CRC",
      paymentMethod: "SINPE",
      seller: address,
      buyer: address,
      reputation: 4.8,
      trades: 23,
      created: "2025-01-15",
      status: "active",
      description: "I need to buy CRCX",
    },
  ]);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.fiatCurrency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesToken =
      selectedToken === "all" || listing.token === selectedToken;
    const matchesType = selectedType === "all" || listing.type === selectedType;

    return matchesSearch && matchesToken && matchesType;
  });

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
    // Remove the incorrect modal closing logic
  };

  const ListingCard = ({ listing }: { listing: MarketplaceListing }) => (
    <Card className="card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fade-in">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <TradeTypeBadge type={listing.type} className="mb-3" />
                <TokenIcon token={listing.token} size="lg" />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="text-3xl font-bold text-foreground">
                      {formatAmount(listing.amount)}
                    </h3>
                    <span className="text-xl font-semibold text-muted-foreground">
                      {listing.token}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground font-medium">
                        Tasa de Cambio
                      </p>
                      <p className="text-foreground font-semibold">
                        {listing.rate} {listing.fiatCurrency}/{listing.token}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">
                        Método de Pago
                      </p>
                      <p className="text-foreground font-semibold">
                        {listing.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trader</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-foreground">
                          {listing.type === "sell"
                            ? listing.seller
                            : listing.buyer}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-50/80 backdrop-blur-sm text-yellow-700 border-yellow-200/50"
                        >
                          ⭐ {listing.reputation} ({listing.trades})
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">
                  Valor Total
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {formatAmount(listing.amount * listing.rate)}
                </p>
                <p className="text-lg font-semibold text-muted-foreground">
                  {listing.fiatCurrency}
                </p>
              </div>

              <Button
                onClick={() => handleTrade(listing)}
                className="btn-emerald px-8 py-2 text-base font-semibold"
              >
                {listing.type === "sell" ? "Comprar Ahora" : "Vender Ahora"}
              </Button>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Activo
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Publicado: {formatDate(listing.created)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-emerald-outline"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Ver en Stellar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-hero-gradient">
              Marketplace
            </h1>
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
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by token or currency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-glass"
                  />
                </div>
              </div>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
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
              <Select value={selectedType} onValueChange={setSelectedType}>
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

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Active Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                {listings.length}
              </div>
              <p className="text-sm text-emerald-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last week
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Total Volume (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                $45,230
              </div>
              <p className="text-sm text-emerald-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8% from yesterday
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Avg. Trade Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">
                $1,250
              </div>
              <p className="text-sm text-red-600 flex items-center">
                <TrendingDown className="w-4 h-4 mr-1" />
                -3% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Listings */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="glass-card bg-white/80 backdrop-blur-sm border border-white/30 p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              All Listings ({filteredListings.length})
            </TabsTrigger>
            <TabsTrigger
              value="buy"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Buy Orders (
              {filteredListings.filter((l) => l.type === "buy").length})
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Sell Orders (
              {filteredListings.filter((l) => l.type === "sell").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buy" className="space-y-6">
            <div className="grid gap-6">
              {filteredListings
                .filter((l) => l.type === "buy")
                .map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-6">
            <div className="grid gap-6">
              {filteredListings
                .filter((l) => l.type === "sell")
                .map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Trade Confirmation Dialog */}
        <Dialog open={open} onOpenChange={() => setOpen(false)}>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-emerald-gradient">
                Initiate Trade
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {selectedListing && (
                  <>
                    You are about to{" "}
                    {selectedListing.type === "sell" ? "buy" : "sell"}{" "}
                    {selectedListing.amount} {selectedListing.token}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedListing && (
              <div className="space-y-4">
                <div className="bg-muted/50 backdrop-blur-sm p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-foreground">
                    Trade Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Amount: {formatAmount(selectedListing.amount)}{" "}
                      {selectedListing.token}
                    </p>
                    <p className="text-muted-foreground">
                      Rate: {selectedListing.rate}{" "}
                      {selectedListing.fiatCurrency}/{selectedListing.token}
                    </p>
                    <p className="text-muted-foreground">
                      Total:{" "}
                      {formatCurrency(
                        selectedListing.amount * selectedListing.rate,
                        selectedListing.fiatCurrency
                      )}
                    </p>
                    <p className="text-muted-foreground">
                      Payment: {selectedListing.paymentMethod}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 btn-emerald-outline"
                    onClick={() => setSelectedListing(null)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmTrade}
                    className="flex-1 btn-emerald"
                    disabled={isPending}
                  >
                    {isPending ? "Creating Escrow..." : "Confirm Trade"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

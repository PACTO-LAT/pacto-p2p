'use client';

import { AlertCircle, Plus, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DisputeDialog, ReceiptDialog } from '@/components/shared/DashboardDialogs';
import { ListingDetailsDialog } from '@/components/shared/ListingDetailsDialog';
import { ListingEditDialog } from '@/components/shared/ListingEditDialog';
import { TradeCard } from '@/components/shared/TradeCard';
import { WalletConnectionPrompt } from '@/components/shared/WalletConnectionPrompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDialog } from '@/hooks/use-dialog';
import { useAuth } from '@/hooks/use-auth';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import type { DashboardEscrow, DashboardListing } from '@/lib/types';
import { useMarketplaceListings } from '@/hooks/use-listings';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const { dialogState, openDialog, closeDialog } = useDialog<DashboardEscrow>();
  const {
    dialogState: listingDialogState,
    openDialog: openListingDialog,
    closeDialog: closeListingDialog,
  } = useDialog<DashboardListing>();
  const {
    dialogState: listingEditState,
    openDialog: openListingEditDialog,
    closeDialog: closeListingEditDialog,
    setSelectedItem: setEditListing,
  } = useDialog<DashboardListing>();

  const { data: marketplace = [], isLoading } = useMarketplaceListings({
    status: 'active',
  });
  const activeListings = marketplace.map(
    (m): DashboardListing => ({
      id: String(m.id),
      type: m.type,
      token: m.token,
      amount: m.amount,
      rate: m.rate,
      fiatCurrency: m.fiatCurrency,
      status: m.status,
      created: m.created,
      seller: m.seller,
      buyer: m.buyer,
      description: m.description,
      paymentMethod: m.paymentMethod,
    })
  );
  const activeEscrows: DashboardEscrow[] = [];

  const handleTradeAction = (
    trade: DashboardListing | DashboardEscrow,
    action: string
  ) => {
    const isListing = (t: DashboardListing | DashboardEscrow): t is DashboardListing =>
      'rate' in t && 'fiatCurrency' in t;

    if (action === 'view' && isListing(trade)) {
      openListingDialog(trade);
      return;
    }

    if (action === 'manage' && isListing(trade)) {
      setEditListing(trade);
      openListingEditDialog(trade);
      return;
    }

    console.log(`${action} action for trade:`, trade.id);
  };

  const handleOpenDialog = (trade: DashboardListing | DashboardEscrow) => {
    if ('progress' in trade) {
      // Type guard for escrow
      openDialog(trade);
    }
  };

  const handleUploadReceipt = (escrow: DashboardEscrow, file: File) => {
    console.log('Uploading receipt for escrow:', escrow.id, file);
    closeDialog();
  };

  const handleCreateDispute = (escrow: DashboardEscrow, reason: string) => {
    console.log('Creating dispute for escrow:', escrow.id, reason);
    closeDialog();
  };

  const { address, isConnected } = useGlobalAuthenticationStore();

  // Show wallet connection prompt if user is logged in but doesn't have wallet linked
  // AND wallet is not already connected
  useEffect(() => {
    if (
      !authLoading &&
      user &&
      !user.stellar_address &&
      !showWalletPrompt &&
      !(isConnected && address)
    ) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowWalletPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, showWalletPrompt, isConnected, address]);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1 sm:mt-2">
            Manage your OTC trades and escrows
          </p>
        </div>
      </div>

      {/* Wallet Connection Banner */}
      {user && !user.stellar_address && (
        <Card className="glass-card border-orange-200/30 bg-orange-50/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center glow-emerald flex-shrink-0">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-semibold text-orange-900 text-base sm:text-lg leading-tight">
                    Link your Stellar wallet
                  </p>
                  <p className="text-orange-700 text-xs sm:text-sm md:text-base leading-relaxed">
                    Connect your wallet to your account to start trading
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowWalletPrompt(true)}
                className="btn-emerald w-full md:w-auto mt-2 md:mt-0 flex-shrink-0"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="listings" className="space-y-4 sm:space-y-6">
        <TabsList className="flex flex-col sm:flex-row h-auto p-1.5 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/50 gap-2 w-full sm:w-auto">
          <TabsTrigger
            value="listings"
            className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-3 sm:py-2.5 text-sm font-medium border border-transparent cursor-pointer w-full sm:w-auto sm:flex-initial whitespace-nowrap justify-center min-h-[44px] sm:min-h-0"
          >
            My Listings
          </TabsTrigger>
          <TabsTrigger
            value="escrows"
            className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-3 sm:py-2.5 text-sm font-medium border border-transparent cursor-pointer w-full sm:w-auto sm:flex-initial whitespace-nowrap justify-center min-h-[44px] sm:min-h-0"
          >
            Active Orders
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-4 py-3 sm:py-2.5 text-sm font-medium border border-transparent cursor-pointer w-full sm:w-auto sm:flex-initial whitespace-nowrap justify-center min-h-[44px] sm:min-h-0"
          >
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              Active Listings
            </h2>
            <Link href="/dashboard/listings/create" className="w-full sm:w-auto">
              <Button className="btn-emerald w-full sm:w-auto text-sm sm:text-base">
                <Plus className="w-4 h-4 mr-2" />
                New Listing
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:gap-6">
            {isLoading ? (
              <Card className="card">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="text-muted-foreground text-sm sm:text-base">
                    Loading listings...
                  </div>
                </CardContent>
              </Card>
            ) : activeListings.length === 0 ? (
              <Card className="card">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="text-muted-foreground text-sm sm:text-base">
                    No active listings
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 mt-2">
                    Create your first listing to start trading
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeListings.map((listing) => (
                <TradeCard
                  key={listing.id}
                  trade={listing}
                  onAction={handleTradeAction}
                  onOpenDialog={handleOpenDialog}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="escrows" className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-gradient leading-tight">
            Active Orders
          </h2>

          <div className="grid gap-4 sm:gap-6">
            {activeEscrows.length === 0 ? (
              <Card className="card">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="text-muted-foreground text-sm sm:text-base">
                    No active orders
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 mt-2">
                    Your active escrow orders will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeEscrows.map((escrow) => (
                <TradeCard
                  key={escrow.id}
                  trade={escrow}
                  onAction={handleTradeAction}
                  onOpenDialog={handleOpenDialog}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-gradient leading-tight">
            Trade History
          </h2>
          <Card className="card">
            <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 glow-emerald">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <p className="text-base sm:text-lg text-muted-foreground mb-2 font-medium">
                No completed trades yet
              </p>
              <p className="text-sm sm:text-base text-muted-foreground/80 max-w-md mx-auto">
                Your trade history will appear here once you complete your first
                transaction
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ListingDetailsDialog
        open={listingDialogState.isOpen}
        onOpenChange={closeListingDialog}
        listing={listingDialogState.selectedItem}
      />
      <ListingEditDialog
        open={listingEditState.isOpen}
        onOpenChange={closeListingEditDialog}
        listing={listingEditState.selectedItem}
      />

      <ReceiptDialog
        open={dialogState.isOpen}
        onOpenChange={closeDialog}
        escrow={dialogState.selectedItem}
        onUpload={handleUploadReceipt}
      />

      <DisputeDialog
        open={dialogState.isOpen}
        onOpenChange={closeDialog}
        escrow={dialogState.selectedItem}
        onCreate={handleCreateDispute}
      />

      {/* Wallet Connection Prompt */}
      <WalletConnectionPrompt
        open={showWalletPrompt}
        onOpenChange={setShowWalletPrompt}
      />
    </div>
  );
}

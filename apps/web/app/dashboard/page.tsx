'use client';

import { AlertCircle, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardEscrow, DashboardListing } from '@/lib/types';
import { DisputeDialog, ReceiptDialog } from '@/components/shared/DashboardDialogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListingDetailsDialog } from '@/components/shared/ListingDetailsDialog';
import { ListingEditDialog } from '@/components/shared/ListingEditDialog';
import { TradeCard } from '@/components/shared/TradeCard';
import { WalletConnectionPrompt } from '@/components/shared/WalletConnectionPrompt';
import { useAuth } from '@/hooks/use-auth';
import { useDialog } from '@/hooks/use-dialog';
import { useInitializeTrade } from '@/hooks/use-trades';
import { uploadReceipt } from '@/lib/services/receipts';
import { sileo } from 'sileo';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { useMarketplaceListings } from '@/hooks/use-listings';
import { useTrades } from '@/hooks/use-trades-history';
import { useMeMerchant } from '../../hooks/useMerchant';
import { TradeHistorySkeleton } from '@/components/shared/TradeHistorySkeleton';
import { useEscrowsByRoleQuery } from '@/hooks/use-escrows';
import { useEscrowSelection } from '@/hooks/use-escrow-selection';
import { useEscrowActions } from '@/hooks/use-escrow-actions';
import {
  EscrowCard,
  EscrowDetailsModal,
  ReportPaymentModal,
  EmptyState,
  LoadingState,
  ErrorState,
} from '@/components/escrow';
import type { Escrow } from '@pacto-p2p/types';
import type { ReportPaymentData } from '@/lib/types/escrow';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const { address, isConnected } = useGlobalAuthenticationStore();

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

  // Escrow modal state
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [isReportPaymentModalOpen, setIsReportPaymentModalOpen] = useState(false);
  const { selectedEscrow, selectEscrow, clearSelectedEscrow } = useEscrowSelection();
  const {
    isReportPaymentLoading,
    handleReportPayment,
    handleConfirmPayment,
    handleDeposit,
    handleDisputeEscrow,
    handleReleaseFunds,
  } = useEscrowActions();

  const { data: merchant, isLoading: merchantLoading } = useMeMerchant();
  const {
    data: trades = [],
    isLoading: tradesLoading,
    isError: tradesError,
    error: tradesErrorDetail,
  } = useTrades(user?.id);
  const { data: marketplace = [], isLoading } = useMarketplaceListings({
    status: 'active',
  });

  // Fetch active escrows from TLW indexer (buyer role = serviceProvider)
  const {
    data: activeEscrows = [],
    isLoading: escrowsLoading,
    error: escrowsError,
  } = useEscrowsByRoleQuery({
    role: 'serviceProvider',
    roleAddress: address,
    isActive: true,
    enabled: !!address,
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

  const handleUploadReceipt = async (
    escrow: DashboardEscrow,
    file: File
  ): Promise<void> => {
    if (!escrow.contractId || !escrow.roles?.serviceProvider) {
      sileo.error({
        title: 'Cannot report payment',
        description:
          'This escrow is missing contract data. Ensure you are viewing an active escrow from Trustless Work.',
      });
      return;
    }

    setIsUploadingReceipt(true);
    try {
      const receiptUrl = await uploadReceipt(escrow.id, file);
      await reportPayment(
        {
          contractId: escrow.contractId,
          roles: { serviceProvider: escrow.roles.serviceProvider },
        },
        receiptUrl
      );
      sileo.success({ title: 'Payment receipt uploaded successfully' });
      closeDialog();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload receipt. Please try again.';
      sileo.error({ title: 'Upload failed', description: message });
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const handleCreateDispute = (escrow: DashboardEscrow, reason: string) => {
    console.log('Creating dispute for escrow:', escrow.id, reason);
    closeDialog();
  };

  // Escrow modal handlers
  const openEscrowModal = (escrow: Escrow) => {
    selectEscrow(escrow);
    setIsEscrowModalOpen(true);
  };

  const onReportPayment = (escrow: Escrow) => {
    selectEscrow(escrow);
    setIsReportPaymentModalOpen(true);
  };

  const onSubmitReportPayment = async (data: ReportPaymentData) => {
    if (selectedEscrow) {
      const success = await handleReportPayment(selectedEscrow, data);
      if (success) {
        setIsReportPaymentModalOpen(false);
      }
    }
  };

  const [hasShownWalletPrompt, setHasShownWalletPrompt] = useState(false);
  const [userDismissedPrompt, setUserDismissedPrompt] = useState(false);

  // Reset dismissed flag when wallet gets connected and linked
  useEffect(() => {
    if (isConnected && address && user?.stellar_address === address) {
      setUserDismissedPrompt(false);
      setHasShownWalletPrompt(false);
    }
  }, [isConnected, address, user?.stellar_address]);

  // Show wallet connection prompt if user is logged in but doesn't have wallet linked
  // AND wallet is not already connected
  useEffect(() => {
    if (userDismissedPrompt || showWalletPrompt) {
      return;
    }

    if (isConnected && address && user?.stellar_address === address) {
      return;
    }

    if (
      !authLoading &&
      user &&
      !user.stellar_address &&
      !hasShownWalletPrompt &&
      !(isConnected && address)
    ) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setShowWalletPrompt(true);
        setHasShownWalletPrompt(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, showWalletPrompt, isConnected, address, hasShownWalletPrompt, userDismissedPrompt]);

  // Handle when user closes the prompt
  const handleWalletPromptChange = (open: boolean) => {
    setShowWalletPrompt(open);
    if (!open && (!isConnected || !address || user?.stellar_address !== address)) {
      setUserDismissedPrompt(true);
    }
  };

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

      {/* Main Content Tabs */}
      <Tabs id="dashboard-tabs" defaultValue="listings" className="space-y-4 sm:space-y-6">
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
            {merchantLoading ? (
              <Button className="btn-emerald w-full sm:w-auto text-sm sm:text-base" disabled>
                <Plus className="w-4 h-4 mr-2" />
                Checking merchant status...
              </Button>
            ) : merchant ? (
              <Link href="/dashboard/listings/create" className="w-full sm:w-auto">
                <Button className="btn-emerald w-full sm:w-auto text-sm sm:text-base">
                  <Plus className="w-4 h-4 mr-2" />
                  New Listing
                </Button>
              </Link>
            ) : (
              <Button className="btn-emerald w-full sm:w-auto text-sm sm:text-base" disabled title="You must be a merchant to create listings">
                <Plus className="w-4 h-4 mr-2" />
                New Listing
              </Button>
            )}
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
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            Active Orders
          </h2>

          {escrowsLoading ? (
            <LoadingState />
          ) : escrowsError ? (
            <ErrorState error={escrowsError} />
          ) : activeEscrows.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {activeEscrows.map((escrow) => (
                <EscrowCard
                  key={escrow.engagementId}
                  escrow={escrow}
                  onClick={openEscrowModal}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
            Trade History
          </h2>

          {tradesLoading ? (
            <TradeHistorySkeleton />
          ) : tradesError ? (
            <Card className="card">
              <CardContent className="p-8 sm:p-12 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <p className="text-base sm:text-lg text-muted-foreground mb-2 font-medium">
                  Failed to load trade history
                </p>
                <p className="text-sm text-muted-foreground/80 max-w-md mx-auto">
                  {tradesErrorDetail instanceof Error
                    ? tradesErrorDetail.message
                    : 'Please try again later.'}
                </p>
              </CardContent>
            </Card>
          ) : trades.length === 0 ? (
            <Card className="card">
              <CardContent className="p-8 sm:p-12 lg:p-16 text-center">
                <p className="text-base sm:text-lg text-muted-foreground mb-2 font-medium">
                  No completed trades yet
                </p>
                <p className="text-sm sm:text-base text-muted-foreground/80 max-w-md mx-auto">
                  Your trade history will appear here once you complete your first
                  transaction
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {trades.map((trade) => (
                <TradeCard
                  key={trade.id}
                  trade={trade}
                  onAction={handleTradeAction}
                  onOpenDialog={handleOpenDialog}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Listing Dialogs */}
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
        isUploading={isUploadingReceipt}
      />

      <DisputeDialog
        open={dialogState.isOpen}
        onOpenChange={closeDialog}
        escrow={dialogState.selectedItem}
        onCreate={handleCreateDispute}
      />

      {/* Escrow Modals */}
      <EscrowDetailsModal
        open={isEscrowModalOpen}
        onOpenChange={(open) => {
          setIsEscrowModalOpen(open);
          if (!open) clearSelectedEscrow();
        }}
        escrow={selectedEscrow}
        activeTab="buyer"
        onReportPayment={onReportPayment}
        onConfirmPayment={async (escrow) => { await handleConfirmPayment(escrow); }}
        onDeposit={async (escrow) => { await handleDeposit(escrow); }}
        onDisputeEscrow={async (escrow) => { await handleDisputeEscrow(escrow); }}
        onReleaseFunds={async (escrow) => { await handleReleaseFunds(escrow); }}
      />

      <ReportPaymentModal
        open={isReportPaymentModalOpen}
        onOpenChange={(open) => {
          if (!isReportPaymentLoading) {
            setIsReportPaymentModalOpen(open);
            if (!open) clearSelectedEscrow();
          }
        }}
        onSubmit={onSubmitReportPayment}
        isLoading={isReportPaymentLoading}
      />

      {/* Wallet Connection Prompt */}
      <WalletConnectionPrompt
        open={showWalletPrompt}
        onOpenChange={handleWalletPromptChange}
      />
    </div>
  );
}

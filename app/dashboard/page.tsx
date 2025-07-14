'use client';

import { AlertCircle, Plus, TrendingUp, Wallet } from 'lucide-react';
import Link from 'next/link';
import { DisputeDialog, ReceiptDialog } from '@/components/dashboard-dialogs';
import { DashboardLayout } from '@/components/dashboard-layout';
import { TradeCard } from '@/components/trade-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDialog } from '@/hooks/use-dialog';
import { useWallet } from '@/hooks/use-wallet';
import { mockEscrows, mockListings } from '@/lib/mock-data';
import type { DashboardEscrow, DashboardListing } from '@/lib/types';
import useGlobalAuthenticationStore from '@/store/wallet.store';

export default function DashboardPage() {
  const { address } = useGlobalAuthenticationStore();
  const { handleConnect } = useWallet();
  const { dialogState, openDialog, closeDialog } = useDialog<DashboardEscrow>();

  const activeListings = mockListings;
  const activeEscrows = mockEscrows;

  const handleTradeAction = (
    trade: DashboardListing | DashboardEscrow,
    action: string
  ) => {
    console.log(`${action} action for trade:`, trade.id);
    // Handle different actions (view, manage, etc.)
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Gestiona tus trades OTC y escrows
            </p>
          </div>
        </div>

        {/* Wallet Connection */}
        {!address && (
          <Card className="glass-card border-orange-200/30 bg-orange-50/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100/80 backdrop-blur-sm rounded-xl flex items-center justify-center glow-emerald">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-900 text-lg">
                      Conecta tu wallet de Stellar
                    </p>
                    <p className="text-orange-700">
                      Conecta tu wallet para comenzar a hacer trading
                    </p>
                  </div>
                </div>
                <Button onClick={handleConnect} className="btn-emerald">
                  <Wallet className="w-4 h-4 mr-2" />
                  Conectar Wallet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="glass-card bg-white/80 backdrop-blur-sm border border-white/30 p-1">
            <TabsTrigger
              value="listings"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Mis Listings
            </TabsTrigger>
            <TabsTrigger
              value="escrows"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Escrows Activos
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-emerald-gradient">
                Listings Activos
              </h2>
              <Link href="/dashboard/listings/create">
                <Button className="btn-emerald">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Listing
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              {activeListings.map((listing) => (
                <TradeCard
                  key={listing.id}
                  trade={listing}
                  onAction={handleTradeAction}
                  onOpenDialog={handleOpenDialog}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="escrows" className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-gradient">
              Escrows Activos
            </h2>

            <div className="grid gap-6">
              {activeEscrows.map((escrow) => (
                <TradeCard
                  key={escrow.id}
                  trade={escrow}
                  onAction={handleTradeAction}
                  onOpenDialog={handleOpenDialog}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <h2 className="text-2xl font-bold text-emerald-gradient">
              Historial de Trades
            </h2>
            <Card className="card">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 glow-emerald">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg text-muted-foreground mb-2">
                  No hay trades completados aún
                </p>
                <p className="text-muted-foreground">
                  Tu historial de trades aparecerá aquí una vez que completes tu
                  primera transacción
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
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
      </div>
    </DashboardLayout>
  );
}

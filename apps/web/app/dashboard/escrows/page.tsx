'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEscrowsByRoleQuery } from '@/hooks/use-escrows';
import useGlobalAuthenticationStore from '@/store/wallet.store';
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

export default function EscrowsPage() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [isReportPaymentModalOpen, setIsReportPaymentModalOpen] =
    useState(false);

  const { address } = useGlobalAuthenticationStore();
  const { selectedEscrow, selectEscrow, clearSelectedEscrow } =
    useEscrowSelection();
  const {
    isReportPaymentLoading,
    handleReportPayment,
    handleConfirmPayment,
    handleDeposit,
    handleDisputeEscrow,
    handleReleaseFunds,
  } = useEscrowActions();

  // Determine role based on active tab
  const role = activeTab === 'seller' ? 'approver' : 'serviceProvider';

  // Fetch escrows where the user is involved in any role
  const {
    data: escrows = [],
    isLoading,
    error,
  } = useEscrowsByRoleQuery({
    role: role,
    roleAddress: address,
    isActive: true,
    enabled: !!address,
  });

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

  const onConfirmPayment = async (escrow: Escrow) => {
    await handleConfirmPayment(escrow);
  };

  const onDeposit = async (escrow: Escrow) => {
    await handleDeposit(escrow);
  };

  const onDisputeEscrow = async (escrow: Escrow) => {
    await handleDisputeEscrow(escrow);
  };

  const onReleaseFunds = async (escrow: Escrow) => {
    await handleReleaseFunds(escrow);
  };

  const openEscrowModal = (escrow: Escrow) => {
    selectEscrow(escrow);
    setIsEscrowModalOpen(true);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
          Orders
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1 sm:mt-2">
          Monitor and manage your active escrow contracts
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'buyer' | 'seller')}
        className="space-y-4 sm:space-y-6"
      >
        <TabsList className="flex flex-col sm:flex-row h-auto p-1.5 bg-muted/30 backdrop-blur-sm rounded-lg border border-border/50 gap-2 w-full sm:w-auto">
          <TabsTrigger
            value="buyer"
            className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-6 py-3 sm:py-2.5 text-sm font-medium border border-transparent cursor-pointer w-full sm:w-auto sm:flex-initial whitespace-nowrap justify-center min-h-[44px] sm:min-h-0"
          >
            Buyer
          </TabsTrigger>
          <TabsTrigger
            value="seller"
            className="bg-card/60 hover:bg-card/80 active:bg-card/90 text-muted-foreground hover:text-foreground data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-emerald-600 transition-all duration-200 rounded-md px-6 py-3 sm:py-2.5 text-sm font-medium border border-transparent cursor-pointer w-full sm:w-auto sm:flex-initial whitespace-nowrap justify-center min-h-[44px] sm:min-h-0"
          >
            Seller
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Escrows List */}
      <div className="space-y-4 sm:space-y-6">
        {escrows.length === 0 ? (
          <EmptyState />
        ) : (
          escrows.map((escrow) => (
            <EscrowCard
              key={escrow.engagementId}
              escrow={escrow}
              onClick={openEscrowModal}
            />
          ))
        )}
      </div>

      {/* Escrow Details Modal */}
      <EscrowDetailsModal
        open={isEscrowModalOpen}
        onOpenChange={(open) => {
          setIsEscrowModalOpen(open);
          if (!open) {
            clearSelectedEscrow();
          }
        }}
        escrow={selectedEscrow}
        activeTab={activeTab}
        onReportPayment={onReportPayment}
        onConfirmPayment={onConfirmPayment}
        onDeposit={onDeposit}
        onDisputeEscrow={onDisputeEscrow}
        onReleaseFunds={onReleaseFunds}
      />

      {/* Report Payment Modal */}
      <ReportPaymentModal
        open={isReportPaymentModalOpen}
        onOpenChange={(open) => {
          if (!isReportPaymentLoading) {
            setIsReportPaymentModalOpen(open);
            if (!open) {
              clearSelectedEscrow();
            }
          }
        }}
        onSubmit={onSubmitReportPayment}
        isLoading={isReportPaymentLoading}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
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
import { ReportPaymentData } from '@/lib/types/escrow';

export default function EscrowsPage() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [isReportPaymentModalOpen, setIsReportPaymentModalOpen] = useState(false);
  
  const { address } = useGlobalAuthenticationStore();
  const { selectedEscrow, selectEscrow, clearSelectedEscrow } = useEscrowSelection();
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
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">Orders</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Monitor and manage your active escrow contracts
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'buyer' | 'seller')}
          className="space-y-6"
        >
          <TabsList className="glass-card bg-white/80 backdrop-blur-sm border border-white/30 p-1">
            <TabsTrigger
              value="buyer"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Buyer
            </TabsTrigger>
            <TabsTrigger
              value="seller"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
            >
              Seller
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Escrows List */}
        <div className="space-y-6">
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
    </DashboardLayout>
  );
}

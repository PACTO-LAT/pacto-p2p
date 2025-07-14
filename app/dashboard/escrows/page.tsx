/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import {
  AlertTriangle,
  Banknote,
  CheckCircle,
  DollarSign,
  ExternalLink,
  Loader2,
  Shield,
  Unlock,
  User,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useEscrowsByRoleQuery } from '@/hooks/use-escrows';
import { useInitializeTrade } from '@/hooks/use-trades';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { getTrustlineName } from '@/utils/getTrustline';

//! Using any for now since Escrow type is not properly defined
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Escrow = any;

import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useEscrowSelection } from '@/hooks/use-escrow-selection';
import { formatAmount } from '@/lib/dashboard-utils';

export default function EscrowsPage() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [isReportPaymentModalOpen, setIsReportPaymentModalOpen] =
    useState(false);
  const [isReportPaymentLoading, setIsReportPaymentLoading] = useState(false);
  const { address } = useGlobalAuthenticationStore();
  const { selectedEscrow, selectEscrow, clearSelectedEscrow } =
    useEscrowSelection();
  const {
    reportPayment,
    depositFunds,
    disputeEscrow,
    releaseFunds,
    confirmPayment,
  } = useInitializeTrade();

  // Form for report payment
  const reportPaymentForm = useForm({
    defaultValues: {
      evidence: '',
    },
  });

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

  const handleReportPayment = (escrow: Escrow) => {
    selectEscrow(escrow);
    setIsReportPaymentModalOpen(true);
  };

  const onSubmitReportPayment = async (data: { evidence: string }) => {
    if (selectedEscrow) {
      setIsReportPaymentLoading(true);
      try {
        await reportPayment(selectedEscrow, data.evidence);
        reportPaymentForm.reset();
        setIsReportPaymentModalOpen(false);
        selectEscrow({
          ...selectedEscrow,
          milestones: [
            {
              ...selectedEscrow.milestones[0],
              status: 'pendingApproval',
              evidence: data.evidence,
            },
          ],
        });
      } catch (_error) {
        toast.error('Error al reportar el pago');
      } finally {
        setIsReportPaymentLoading(false);
      }
    }
  };

  const handleConfirmPayment = async (escrow: Escrow) => {
    if (selectedEscrow) {
      try {
        await confirmPayment(escrow);
        selectEscrow({
          ...selectedEscrow,
          milestones: [
            {
              ...selectedEscrow.milestones[0],
              status: 'approved',
              approved: true,
            },
          ],
        });
      } catch (_error) {
        toast.error('Error al confirmar el pago');
      }
    }
  };

  const handleDeposit = async (escrow: Escrow) => {
    if (selectedEscrow) {
      try {
        await depositFunds(escrow);

        selectEscrow({
          ...selectedEscrow,
          balance: escrow.amount,
        });
      } catch (_error) {
        toast.error('Error al depositar fondos');
      }
    }
  };

  const handleDisputeEscrow = async (escrow: Escrow) => {
    if (selectedEscrow) {
      try {
        await disputeEscrow(escrow);

        selectEscrow({
          ...selectedEscrow,
          flags: {
            disputed: true,
          },
        });
      } catch (_error) {
        toast.error('Error al disputar el escrow');
      }
    }
  };

  const handleReleaseFunds = async (escrow: Escrow) => {
    if (selectedEscrow) {
      try {
        await releaseFunds(escrow);

        selectEscrow({
          ...selectedEscrow,
          flags: {
            released: true,
          },
          balance: 0,
        });
      } catch (_error) {
        toast.error('Error al liberar fondos');
      }
    }
  };

  const openEscrowModal = (escrow: Escrow) => {
    selectEscrow(escrow);
    setIsEscrowModalOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Cargando escrows...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Error al cargar escrows
            </h3>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
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
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted/50 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center glow-emerald">
                  <Shield className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No escrows found
                </h3>
                <p className="text-muted-foreground mb-4">
                  You don&apos;t have any active escrow contracts yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            escrows.map((escrow, index) => {
              return (
                <Card
                  key={index}
                  className="card hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-fade-in cursor-pointer"
                  onClick={() => openEscrowModal(escrow)}
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-semibold text-xl text-foreground">
                              {escrow.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {escrow.engagementId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {escrow.flags?.resolved || escrow.flags?.released ? (
                            <span className="text-lg font-bold text-emerald-600">
                              Finalizado
                            </span>
                          ) : (
                            <span className="text-lg font-bold text-muted-foreground">
                              En curso
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Description
                        </p>
                        <p className="font-medium text-foreground">
                          {escrow.description}
                        </p>
                      </div>

                      {/* Amount and Details */}
                      <div className="bg-muted/50 backdrop-blur-sm p-4 rounded-lg border border-border/50">
                        <div className="flex items-center justify-center gap-10">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Amount
                            </p>
                            <p className="text-2xl font-bold text-emerald-600">
                              {formatAmount(escrow.amount)}{' '}
                              {getTrustlineName(escrow.trustline.address)}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Balance
                            </p>
                            <p className="text-2xl font-bold text-emerald-600">
                              {formatAmount(escrow.balance)}{' '}
                              {getTrustlineName(escrow.trustline.address)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Key Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Seller Address
                            </p>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 backdrop-blur-sm rounded-md">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono text-xs text-foreground">
                                {escrow.roles.approver.slice(0, 8)}...
                                {escrow.roles.approver.slice(-8)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Buyer Address
                            </p>
                            <div className="flex items-center gap-2 p-2 bg-muted/50 backdrop-blur-sm rounded-md">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono text-xs text-foreground">
                                {escrow.roles.serviceProvider.slice(0, 8)}...
                                {escrow.roles.serviceProvider.slice(-8)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Asset
                            </p>
                            <div className="p-2 bg-muted/50 backdrop-blur-sm rounded-md">
                              <span className="font-mono text-xs text-foreground">
                                {getTrustlineName(escrow.trustline.address)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Engagement ID
                            </p>
                            <div className="p-2 bg-emerald-50/80 backdrop-blur-sm rounded-md">
                              <span className="font-mono text-sm font-medium text-emerald-700">
                                {escrow.engagementId}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-border/50">
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-emerald-outline"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Stellar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Escrow Details Modal */}
        <Dialog
          open={isEscrowModalOpen}
          onOpenChange={(open) => {
            setIsEscrowModalOpen(open);
            if (!open) {
              clearSelectedEscrow();
            }
          }}
        >
          <DialogContent className="glass-card !max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-emerald-gradient">
                Detalles del Escrow
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Información completa y acciones disponibles para este contrato
                de escrow
              </DialogDescription>
            </DialogHeader>

            {selectedEscrow && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-muted/50 backdrop-blur-sm p-6 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-600">
                        {formatAmount(selectedEscrow.amount)}{' '}
                        {getTrustlineName(selectedEscrow.trustline.address)}
                        <span className="text-muted-foreground mx-3">
                          | {formatAmount(selectedEscrow.balance)}{' '}
                          {getTrustlineName(selectedEscrow.trustline.address)}
                        </span>
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        Engagement ID: {selectedEscrow.engagementId}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      {selectedEscrow.flags?.released ? (
                        <span className="font-semibold text-emerald-600">
                          Liberado
                        </span>
                      ) : selectedEscrow.flags?.resolved ? (
                        <span className="font-semibold text-emerald-600">
                          Resuelto
                        </span>
                      ) : selectedEscrow.flags?.disputed ? (
                        <span className="font-semibold text-red-600">
                          Disputado
                        </span>
                      ) : selectedEscrow.milestones[0].status ===
                        'pendingApproval' ? (
                        <span className="font-semibold text-yellow-600">
                          Pendiente de aprobación
                        </span>
                      ) : selectedEscrow.milestones[0].approved ? (
                        <span className="font-semibold text-emerald-600">
                          Confirmado
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg text-foreground">
                    Descripción
                  </h4>
                  <p className="text-foreground bg-muted/50 backdrop-blur-sm p-4 rounded-lg">
                    {selectedEscrow.description}
                  </p>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-foreground">
                      Información del Contrato
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Vendedor
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 backdrop-blur-sm rounded-lg">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm text-foreground">
                            {selectedEscrow.roles.approver.slice(0, 8)}...
                            {selectedEscrow.roles.approver.slice(-8)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Comprador
                        </p>
                        <div className="flex items-center gap-2 p-3 bg-muted/50 backdrop-blur-sm rounded-lg">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm text-foreground">
                            {selectedEscrow.roles.serviceProvider.slice(0, 8)}
                            ...
                            {selectedEscrow.roles.serviceProvider.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-foreground">
                      Detalles Técnicos
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Activo
                        </p>
                        <div className="p-3 bg-muted/50 backdrop-blur-sm rounded-lg">
                          <span className="font-mono text-sm text-foreground">
                            {getTrustlineName(selectedEscrow.trustline.address)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 pt-6 border-t border-border/50">
                  <h4 className="font-semibold text-lg text-foreground">
                    Acciones Disponibles
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeTab === 'buyer' &&
                      selectedEscrow.milestones[0].status !==
                        'pendingApproval' &&
                      !selectedEscrow.flags?.resolved &&
                      !selectedEscrow.flags?.released && (
                        <Button
                          onClick={() => handleReportPayment(selectedEscrow)}
                          className="w-full btn-emerald-outline"
                          variant="outline"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Reportar Pago
                        </Button>
                      )}

                    {activeTab === 'seller' && (
                      <>
                        {!selectedEscrow.milestones[0].approved && (
                          <Button
                            onClick={() => handleConfirmPayment(selectedEscrow)}
                            className="w-full btn-emerald-outline"
                            variant="outline"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmar Pago
                          </Button>
                        )}

                        {selectedEscrow.balance === 0 &&
                          !selectedEscrow.flags?.released &&
                          !selectedEscrow.flags?.resolved && (
                            <Button
                              onClick={() => handleDeposit(selectedEscrow)}
                              className="w-full btn-emerald-outline"
                              variant="outline"
                            >
                              <Banknote className="w-4 h-4 mr-2" />
                              Depositar
                            </Button>
                          )}

                        {selectedEscrow.milestones[0].approved &&
                          selectedEscrow.balance !== 0 && (
                            <Button
                              onClick={() => handleReleaseFunds(selectedEscrow)}
                              className="w-full btn-emerald-outline"
                              variant="outline"
                            >
                              <Unlock className="w-4 h-4 mr-2" />
                              Liberar Fondos
                            </Button>
                          )}
                      </>
                    )}

                    {!selectedEscrow.flags?.disputed &&
                      !selectedEscrow.flags?.resolved &&
                      !selectedEscrow.flags?.released &&
                      selectedEscrow.balance !== 0 && (
                        <Button
                          onClick={() => handleDisputeEscrow(selectedEscrow)}
                          className="w-full btn-emerald-outline"
                          variant="outline"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Disputar
                        </Button>
                      )}

                    <Button
                      variant="outline"
                      className="w-full btn-emerald-outline"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver en Stellar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Report Payment Modal */}
        <Dialog
          open={isReportPaymentModalOpen}
          onOpenChange={(open) => {
            if (!isReportPaymentLoading) {
              setIsReportPaymentModalOpen(open);
              if (!open) {
                clearSelectedEscrow();
              }
            }
          }}
        >
          <DialogContent className="glass-card !max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-emerald-gradient">
                Reportar Pago
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Reporte un pago que no se haya realizado o que no sea el
                correcto. Proporcione evidencia para la resolución.
              </DialogDescription>
            </DialogHeader>
            <Form {...reportPaymentForm}>
              <form
                onSubmit={reportPaymentForm.handleSubmit(onSubmitReportPayment)}
                className="space-y-4"
              >
                <FormField
                  control={reportPaymentForm.control}
                  name="evidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Evidencia (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Fotos, videos, documentos, etc. que respalden su reclamo."
                          disabled={isReportPaymentLoading}
                          className="input-glass"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full btn-emerald"
                  disabled={isReportPaymentLoading}
                >
                  {isReportPaymentLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <DollarSign className="w-4 h-4 mr-2" />
                  )}
                  Reportar Pago
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

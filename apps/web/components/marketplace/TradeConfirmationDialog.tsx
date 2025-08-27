'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Check, ChevronDown, RefreshCw, X, XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatAmount, formatCurrency } from '@/lib/dashboard-utils';
import type { MarketplaceListing } from '@/lib/types/marketplace';
import { cn } from '@/lib/utils';

interface TradeConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedListing: MarketplaceListing | null;
  onConfirm: () => void;
  isPending: boolean;
}

export function TradeConfirmationDialog({
  open,
  onOpenChange,
  selectedListing,
  onConfirm,
  isPending,
}: TradeConfirmationDialogProps) {
  const [amount, setAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  if (!selectedListing) return null;

  const paymentMethods = selectedListing.paymentMethod
    .split(',')
    .map(method => method.trim())
    .filter(method => method.length > 0)
    .map(method => ({ id: method.toLowerCase().replace(/\s+/g, '-'), name: method }));

  const fiatAmount = parseFloat(amount) || 0;
  const cryptoAmount = fiatAmount / selectedListing.rate;
  const maxAvailable = selectedListing.maxAmount || (selectedListing.amount * selectedListing.rate);
  const minAmount = selectedListing.minAmount || 0;
  const isAmountValid = amount !== '' && fiatAmount >= minAmount && fiatAmount <= maxAvailable;

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    const parts = cleanValue.split('.');
    if (parts.length <= 2) {
      const numValue = parseFloat(cleanValue);
      
      if (cleanValue === '' || (!Number.isNaN(numValue) && numValue <= maxAvailable)) {
        setAmount(cleanValue);
      }
    }
  };

  const handleMaxAmount = () => {
    setAmount(maxAvailable.toString());
  };

  const getTerms = () => {
    return selectedListing.terms || [];
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed top-[50%] left-[50%] z-50 w-[90vw] max-w-[1200px] max-h-[85vh] translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-0 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 overflow-y-auto">
          <DialogPrimitive.Title className="sr-only">
            Buy {selectedListing.token} - Trade Confirmation
          </DialogPrimitive.Title>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 h-full">
            {/* Left Section - Advertisers' Terms */}
            <div className="p-6 border-r border-border/50 lg:col-span-2">
              {(selectedListing.description || getTerms().length > 0) && (
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  Advertisers&apos; Terms
                </h4>
              )}
              
              <div className="space-y-3 text-sm">
                {selectedListing.description && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5"></span>
                    <p className="text-muted-foreground">
                      {selectedListing.description}
                    </p>
                  </div>
                )}
                
                {getTerms().map((term, index) => (
                  <div key={`term-${term.type}-${index}`} className="flex items-start gap-2">
                    {term.type === 'positive' ? (
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <p className="text-muted-foreground">
                      {term.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section - Transaction Form */}
            <div className="p-6 bg-muted/20 lg:col-span-3">
              <div className="h-full flex flex-col justify-center max-w-4xl mx-auto">
                {/* Price Display */}
                <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg mb-6">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {selectedListing.fiatCurrency === 'CRC' ? '₡' : '$'} {Number(selectedListing.rate).toFixed(2)} {selectedListing.fiatCurrency}
                    </span>
                    <RefreshCw className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-emerald-500 transition-colors" />
                  </div>
                </div>

                {/* Horizontal Form Fields */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* You Pay Input */}
                  <div className="bg-card/50 border border-border/50 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">You Pay</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 px-4 text-xs"
                        onClick={handleMaxAmount}
                      >
                        All
                      </Button>
                    </div>
                    <Input
                      type="text"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="text-3xl font-bold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                      placeholder="0.00"
                      onFocus={(e) => e.target.select()}
                    />
                    <div className="text-sm text-muted-foreground mt-2">
                      {selectedListing.fiatCurrency} (Range: {formatCurrency(minAmount, selectedListing.fiatCurrency)} - {formatCurrency(maxAvailable, selectedListing.fiatCurrency)})
                      {amount !== '' && fiatAmount < minAmount && (
                        <div className="text-red-500 text-xs mt-1">
                          Minimum amount is {formatCurrency(minAmount, selectedListing.fiatCurrency)}
                        </div>
                      )}
                      {amount !== '' && fiatAmount > maxAvailable && (
                        <div className="text-red-500 text-xs mt-1">
                          Maximum amount is {formatCurrency(maxAvailable, selectedListing.fiatCurrency)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* You Receive Input */}
                  <div className="bg-card/50 border border-border/50 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">You Receive</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{selectedListing.token}</span>
                        <div className="w-5 h-5 bg-emerald-500 rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-foreground">
                      {formatAmount(cryptoAmount)}
                    </div>
                  </div>
                </div>

                {/* Available Amount Display */}
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(maxAvailable, selectedListing.fiatCurrency)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Max available from seller
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="bg-card/50 border border-border/50 rounded-lg p-5 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      {selectedPaymentMethod 
                        ? `${paymentMethods.find(m => m.id === selectedPaymentMethod)?.name} - ${selectedListing.fiatCurrency}`
                        : 'Set my payment method'
                      }
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPaymentMethods(!showPaymentMethods)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span>{selectedPaymentMethod ? paymentMethods.length - 1 : paymentMethods.length}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", showPaymentMethods && "rotate-180")} />
                    </Button>
                  </div>
                  
                  {showPaymentMethods && (
                    <div className="mt-4 space-y-2">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors w-full text-left",
                            selectedPaymentMethod === method.id
                              ? "bg-emerald-500/10 border border-emerald-500/20"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => {
                            setSelectedPaymentMethod(method.id);
                            setShowPaymentMethods(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedPaymentMethod(method.id);
                              setShowPaymentMethods(false);
                            }
                          }}
                        >
                          <span className="text-lg"></span>
                          <span className="text-sm font-medium">{method.name}</span>
                          {selectedPaymentMethod === method.id && (
                            <Check className="w-4 h-4 text-emerald-500 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Buy Button */}
                <Button
                  onClick={onConfirm}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 rounded-lg text-lg"
                  disabled={isPending || !isAmountValid || !selectedPaymentMethod}
                >
                  {isPending ? 'Creating Escrow...' : `Buy ${selectedListing.token}`}
                </Button>
              </div>
            </div>
          </div>
          
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

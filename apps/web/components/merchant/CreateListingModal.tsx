'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, type Resolver, useForm } from 'react-hook-form';
import { sileo } from 'sileo';
import { CreateListingProgress } from '@/components/merchant/CreateListingProgress';
import {
  PaymentLimitsStep,
  PricingStep,
  ReviewStep,
  TradeTypeStep,
} from '@/components/merchant/steps';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { useCreateListing } from '@/hooks/use-listings';
import {
  toCreateListingData,
  type UIListingFormInput,
} from '@/lib/marketplace-utils';
import {
  LISTING_FORM_DEFAULT_VALUES,
  type ListingFormValues,
  listingFormSchema,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
  STEP_3_FIELDS,
} from '@/lib/schemas/listing/listing-form-schema';
import useGlobalAuthenticationStore from '@/store/wallet.store';
import { useMeMerchant } from '../../hooks/useMerchant';

type Step = 1 | 2 | 3 | 4;

interface CreateListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateListingModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateListingModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const prevOpenRef = useRef(open);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema) as Resolver<ListingFormValues>,
    defaultValues: LISTING_FORM_DEFAULT_VALUES,
    mode: 'onTouched',
  });

  const tradeType = form.watch('type');
  const modalTitle =
    tradeType === 'buy' ? 'Create Buy Listing' : 'Create Sell Listing';

  const createListing = useCreateListing();
  const { user } = useAuth();
  const walletAddress = useGlobalAuthenticationStore((s) => s.address);
  const { data: merchant, isLoading: merchantLoading } = useMeMerchant();
  const isDirty = form.formState.isDirty;

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      form.reset(LISTING_FORM_DEFAULT_VALUES);
      setStep(1);
      setShowDiscardConfirm(false);
    }
    prevOpenRef.current = open;
  }, [open, form]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setShowDiscardConfirm(false);
        onOpenChange(true);
        return;
      }
      if (isDirty) {
        setShowDiscardConfirm(true);
        return;
      }
      form.reset(LISTING_FORM_DEFAULT_VALUES);
      setStep(1);
      onOpenChange(false);
    },
    [isDirty, onOpenChange, form]
  );

  const handleConfirmDiscard = useCallback(() => {
    form.reset(LISTING_FORM_DEFAULT_VALUES);
    setStep(1);
    setShowDiscardConfirm(false);
    onOpenChange(false);
  }, [form, onOpenChange]);

  const handleCancelDiscard = useCallback(() => {
    setShowDiscardConfirm(false);
  }, []);

  const handleNext = useCallback(async () => {
    if (step === 1) {
      const valid = await form.trigger([...STEP_1_FIELDS]);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await form.trigger([...STEP_2_FIELDS]);
      if (valid) setStep(3);
    } else if (step === 3) {
      const valid = await form.trigger([...STEP_3_FIELDS]);
      if (valid) setStep(4);
    }
  }, [step, form]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }, [step]);

  async function onSubmit(values: ListingFormValues) {
    if (step !== 4) return;
    if (merchantLoading) return;
    if (!merchant) {
      sileo.error({
        title: 'You need a merchant profile to create a listing.',
      });
      return;
    }
    if (!user?.id) {
      sileo.error({ title: 'You must be logged in to create a listing.' });
      return;
    }
    if (!walletAddress) {
      sileo.error({
        title: 'Connect your Stellar wallet first.',
        description:
          'Use the wallet button in the header to connect before creating a listing.',
      });
      return;
    }
    try {
      const listingData = toCreateListingData({
        ...(values as UIListingFormInput),
        sellerAddress: walletAddress,
      });
      await createListing.mutateAsync({ userId: user.id, listingData });
      sileo.success({ title: 'Listing created' });
      form.reset(LISTING_FORM_DEFAULT_VALUES);
      setStep(1);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      sileo.error({ title: 'Failed to create listing' });
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return <TradeTypeStep />;
      case 2:
        return <PricingStep />;
      case 3:
        return <PaymentLimitsStep />;
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  const isStepValid =
    step === 1
      ? form.watch('type') && form.watch('token') && form.watch('amount')
      : step === 2
        ? form.watch('rate') && form.watch('fiatCurrency')
        : step === 3
          ? form.watch('paymentMethod')
          : true;

  if (merchantLoading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogTitle className="sr-only">Loading</DialogTitle>
          <div className="flex items-center justify-center py-12">
            <span className="text-gray-500">Checking merchant status...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!merchant) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogTitle className="sr-only">Merchant Required</DialogTitle>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-center text-lg text-gray-700">
              You need a merchant profile to create a listing.
            </p>
            <Link
              href="/dashboard/merchant"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create Merchant Profile
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {/* Manual backdrop — needed because modal={false} disables the Radix overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => handleOpenChange(false)}
        />
      )}
      <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
        <DialogContent
          className="fixed inset-0 w-full max-h-[100dvh] rounded-none border-0 sm:inset-auto sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-lg sm:max-h-[90vh] sm:rounded-lg sm:border sm:p-6 gap-4 overflow-y-auto"
          onPointerDownOutside={(e) => {
            // Prevent dialog from closing when interacting with Select dropdown (portal outside dialog DOM)
            const target = e.target as Element;
            if (
              target.closest('[data-slot="select-content"]') ||
              target.closest('[data-radix-popper-content-wrapper]')
            ) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>
              {tradeType === 'buy'
                ? 'Set up your buy order — you will pay fiat and receive crypto.'
                : 'Set up your sell order — you will receive fiat and send crypto.'}
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...form}>
            <Form {...form}>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="space-y-4"
                noValidate
              >
                <CreateListingProgress currentStep={step} />
                <div className="min-h-[200px]">{renderStep()}</div>

                <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <div className="flex gap-2">
                    {step > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={createListing.isPending}
                        aria-label="Go to previous step"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    {step < 4 ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid || createListing.isPending}
                        aria-label="Go to next step"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={createListing.isPending}
                        aria-label="Create listing"
                      >
                        {createListing.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Create Listing
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to close? Your
              progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDiscard}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDiscard}>
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

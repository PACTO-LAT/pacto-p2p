'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
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
import { useCreateListing } from '@/hooks/use-listings';
import { useAuth } from '@/hooks/use-auth';
import {
  listingFormSchema,
  LISTING_FORM_DEFAULT_VALUES,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
  STEP_3_FIELDS,
  type ListingFormValues,
} from '@/lib/schemas/listing/listing-form-schema';
import {
  toCreateListingData,
  type UIListingFormInput,
} from '@/lib/marketplace-utils';
import { CreateListingProgress } from '@/components/merchant/CreateListingProgress';
import {
  TradeTypeStep,
  PricingStep,
  PaymentLimitsStep,
  ReviewStep,
} from '@/components/merchant/steps';

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

  const createListing = useCreateListing();
  const { user } = useAuth();
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
    if (!user?.id) {
      toast.error('Connect your wallet first');
      return;
    }
    try {
      const listingData = toCreateListingData(values as UIListingFormInput);
      await createListing.mutateAsync({ userId: user.id, listingData });
      toast.success('Listing created');
      form.reset(LISTING_FORM_DEFAULT_VALUES);
      setStep(1);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Failed to create listing');
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

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="fixed inset-0 w-full max-h-[100dvh] rounded-none border-0 sm:inset-auto sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-lg sm:max-h-[90vh] sm:rounded-lg sm:border sm:p-6 gap-4 overflow-y-auto"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle id="create-listing-modal-title">
              Create Listing
            </DialogTitle>
            <DialogDescription id="create-listing-modal-description">
              Complete the steps below to create your OTC trade listing.
            </DialogDescription>
          </DialogHeader>

          <FormProvider {...form}>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
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
                        type="submit"
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
        <DialogContent
          className="sm:max-w-md"
          aria-describedby="discard-confirm-description"
        >
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription id="discard-confirm-description">
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

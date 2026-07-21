'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getListingPaymentMethodOptions } from '@/lib/payment-methods';
import type { ListingFormValues } from '@/lib/schemas/listing/listing-form-schema';

export function PaymentLimitsStep() {
  const form = useFormContext<ListingFormValues>();
  const [methodOpen, setMethodOpen] = useState(false);
  const methodRef = useRef<HTMLDivElement>(null);

  const type = useWatch({ control: form.control, name: 'type' });
  const fiatCurrency = useWatch({
    control: form.control,
    name: 'fiatCurrency',
  });
  const paymentMethod = useWatch({
    control: form.control,
    name: 'paymentMethod',
  });
  const amount = useWatch({ control: form.control, name: 'amount' });
  const rate = useWatch({ control: form.control, name: 'rate' });
  const isSell = type === 'sell';

  const paymentMethodOptions = getListingPaymentMethodOptions(
    fiatCurrency ?? ''
  );

  useEffect(() => {
    if (
      paymentMethod &&
      !paymentMethodOptions.some((option) => option.label === paymentMethod)
    ) {
      form.setValue('paymentMethod', '');
    }
  }, [paymentMethod, paymentMethodOptions, form]);

  const totalFiat =
    amount &&
    rate &&
    !Number.isNaN(Number(amount)) &&
    !Number.isNaN(Number(rate))
      ? Number(amount) * Number(rate)
      : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (methodRef.current && !methodRef.current.contains(e.target as Node)) {
        setMethodOpen(false);
      }
    }
    if (methodOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [methodOpen]);

  return (
    <div className="space-y-4">
      {/* Payment method */}
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {isSell ? 'How buyers will pay you' : 'How you will pay sellers'}
            </FormLabel>
            <FormControl>
              <div ref={methodRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMethodOpen((o) => !o)}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none hover:border-ring transition-colors"
                >
                  {field.value ? (
                    <span>
                      {paymentMethodOptions.find(
                        (option) => option.label === field.value
                      )?.label ?? field.value}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Select payment method
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {methodOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg overflow-hidden">
                    {paymentMethodOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          field.onChange(option.label);
                          setMethodOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors ${
                          field.value === option.label
                            ? 'bg-emerald-500/10'
                            : ''
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Order limits */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">
            Order limits{fiatCurrency ? ` (${fiatCurrency})` : ''}
          </p>
          {totalFiat !== null && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Based on your listing, the maximum per order is{' '}
              <span className="font-medium text-foreground">
                {totalFiat.toLocaleString()} {fiatCurrency}
              </span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="minAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Min (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    max={totalFiat ?? undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maxAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Max (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={totalFiat ? String(totalFiat) : '0.00'}
                    max={totalFiat ?? undefined}
                    {...field}
                    onChange={(e) => {
                      if (
                        totalFiat !== null &&
                        Number(e.target.value) > totalFiat
                      ) {
                        field.onChange(String(totalFiat));
                      } else {
                        field.onChange(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

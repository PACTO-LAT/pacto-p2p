'use client';

import { useState, useRef, useEffect } from 'react';
import { Calculator, ChevronDown } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { ListingFormValues } from '@/lib/schemas/listing/listing-form-schema';

const CURRENCIES = [
  { value: 'CRC', label: 'CRC', description: 'Costa Rican Colón' },
  { value: 'MXN', label: 'MXN', description: 'Mexican Peso' },
  { value: 'USD', label: 'USD', description: 'US Dollar' },
];

export function PricingStep() {
  const form = useFormContext<ListingFormValues>();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);

  const amount = useWatch({ control: form.control, name: 'amount' });
  const rate = useWatch({ control: form.control, name: 'rate' });
  const token = useWatch({ control: form.control, name: 'token' });
  const type = useWatch({ control: form.control, name: 'type' });
  const fiatCurrency = useWatch({ control: form.control, name: 'fiatCurrency' });
  const isSell = type === 'sell';

  const total =
    amount &&
    rate &&
    !Number.isNaN(Number(amount)) &&
    !Number.isNaN(Number(rate))
      ? (Number(amount) * Number(rate)).toFixed(2)
      : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    }
    if (currencyOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currencyOpen]);

  const rateLabel = token && fiatCurrency
    ? `Price per 1 ${token} (${fiatCurrency})`
    : token
      ? `Price per 1 ${token}`
      : 'Price per Token';

  const rateHint = isSell
    ? 'How much fiat you will receive per token'
    : 'How much fiat you will pay per token';

  const currencyLabel = isSell ? 'You will receive in' : 'You will pay in';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fiatCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{currencyLabel}</FormLabel>
              <FormControl>
                <div ref={currencyRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCurrencyOpen((o) => !o)}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none hover:border-ring transition-colors"
                  >
                    {field.value ? (
                      <span>
                        {CURRENCIES.find((c) => c.value === field.value)?.label ?? field.value}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Select currency</span>
                    )}
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {currencyOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg overflow-hidden">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            field.onChange(c.value);
                            setCurrencyOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors ${
                            field.value === c.value ? 'bg-emerald-500/10' : ''
                          }`}
                        >
                          <span className="font-medium">{c.label}</span>
                          <span className="text-muted-foreground text-xs">{c.description}</span>
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
        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{rateLabel}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground mt-1">{rateHint}</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {total !== null && fiatCurrency && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm text-muted-foreground">
              {isSell ? 'Total you will receive' : 'Total you will pay'}
            </span>
          </div>
          <p className="text-xl font-bold">
            {total} {fiatCurrency}
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import { Calculator } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ListingFormValues } from '@/lib/listing-form-schema';

export function PricingStep() {
  const form = useFormContext<ListingFormValues>();
  const amount = useWatch({ control: form.control, name: 'amount' });
  const rate = useWatch({ control: form.control, name: 'rate' });
  const fiatCurrency = useWatch({ control: form.control, name: 'fiatCurrency' });

  const total =
    amount && rate && !Number.isNaN(Number(amount)) && !Number.isNaN(Number(rate))
      ? (Number(amount) * Number(rate)).toFixed(2)
      : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate per Token</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fiatCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fiat Currency</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRC">
                      CRC - Costa Rican Colón
                    </SelectItem>
                    <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
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
              Total Value
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

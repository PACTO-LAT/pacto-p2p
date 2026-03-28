'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TRUSTLINES } from '@/utils/constants/trustlines';
import { cn } from '@/lib/utils';
import type { ListingFormValues } from '@/lib/schemas/listing/listing-form-schema';

export function TradeTypeStep() {
  const form = useFormContext<ListingFormValues>();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trade Type</FormLabel>
            <FormControl>
              <RadioGroup
                className="flex gap-3"
                value={field.value}
                onValueChange={field.onChange}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="sell" id="modal-type-sell" />
                  <label htmlFor="modal-type-sell">Sell</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="buy" id="modal-type-buy" />
                  <label htmlFor="modal-type-buy">Buy</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset</FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex flex-wrap gap-2"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  {TRUSTLINES.filter((t) => !!t.address).map((t) => (
                    <label
                      key={t.symbol}
                      htmlFor={`modal-token-${t.symbol}`}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm transition-colors',
                        field.value === t.name
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                          : 'border-border hover:border-emerald-400'
                      )}
                    >
                      <RadioGroupItem
                        value={t.name}
                        id={`modal-token-${t.symbol}`}
                        className="sr-only"
                      />
                      {t.symbol}
                    </label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

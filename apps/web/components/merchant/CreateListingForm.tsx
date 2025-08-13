'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useCreateMerchantListing } from '@/hooks/useMerchant';
import type { MerchantListing } from '@/lib/types/merchant';

const schema = z
  .object({
    side: z.enum(['buy', 'sell']),
    asset_code: z.string().min(1),
    price_rate: z.coerce.number().positive(),
    quote_currency: z.string().min(1),
    amount: z.coerce.number().positive(),
    min_amount: z.coerce.number().positive().optional(),
    max_amount: z.coerce.number().positive().optional(),
    description: z.string().optional(),
    payment_methods: z
      .array(
        z.object({
          method: z.string().min(1),
          details: z
            .string()
            .optional()
            .transform((v) => (v ? v.trim() : undefined)),
        })
      )
      .default([]),
  })
  .refine(
    (data) =>
      data.min_amount && data.max_amount
        ? data.min_amount <= data.max_amount
        : true,
    {
      message: 'Min amount must be less than or equal to max amount',
      path: ['min_amount'],
    }
  );

type FormValues = z.infer<typeof schema>;

export function CreateListingForm({
  onCreated,
}: {
  onCreated?: (l: MerchantListing) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      side: 'sell',
      asset_code: '',
      price_rate: 1,
      quote_currency: '',
      amount: 0,
      min_amount: undefined,
      max_amount: undefined,
      description: '',
      payment_methods: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'payment_methods',
  });
  const mutation = useCreateMerchantListing();

  async function onSubmit(values: FormValues) {
    const payload = {
      side: values.side,
      asset_code: values.asset_code,
      price_rate: values.price_rate,
      quote_currency: values.quote_currency,
      amount: values.amount,
      min_amount: values.min_amount,
      max_amount: values.max_amount,
      description: values.description?.trim() || undefined,
      payment_methods: values.payment_methods.map((pm) => ({
        method: pm.method,
        details: pm.details ? safeParseJson(pm.details) : undefined,
      })),
    } satisfies Omit<MerchantListing, 'id' | 'status' | 'created_at'>;

    const created = await mutation.mutateAsync(payload);
    toast.success('Listing created');
    form.reset();
    onCreated?.(created);
  }

  return (
          <Card className="feature-card-dark rounded-2xl p-4 sm:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="side"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Side</FormLabel>
                <FormControl>
                  <RadioGroup
                    className="flex gap-3"
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="buy" id="side-buy" />
                      <label htmlFor="side-buy">Buy</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="sell" id="side-sell" />
                      <label htmlFor="side-sell">Sell</label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="asset_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset code</FormLabel>
                  <FormControl>
                    <Input placeholder="USDC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quote_currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quote currency</FormLabel>
                  <FormControl>
                    <Input placeholder="USD, MXN, CRC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.0001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="min_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Notes, release time, restrictions"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="rounded-2xl border p-4">
            <div className="mb-3 text-sm font-medium">Payment methods</div>
            <div className="space-y-3">
              {fields.map((f, idx) => (
                <div key={f.id} className="grid gap-3 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name={`payment_methods.${idx}.method` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Method</FormLabel>
                        <FormControl>
                          <Input placeholder="ACH, SPEI, SINPE" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`payment_methods.${idx}.details` as const}
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Details (JSON optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={2}
                            placeholder='{"account": "..."}'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="sm:col-span-3 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ method: '', details: '' })}
              >
                Add method
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

function safeParseJson(s?: string) {
  if (!s) return undefined;
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}

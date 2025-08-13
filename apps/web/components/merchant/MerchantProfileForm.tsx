'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type Resolver } from 'react-hook-form';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useUpsertMerchantProfile } from '@/hooks/useMerchant';
import type { Merchant } from '@/lib/types/merchant';

const schema = z.object({
  display_name: z.string().min(2, 'Display name is required'),
  bio: z.string().optional(),
  location: z.string().optional(),
  languages: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  telegram: z.string().url().optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')),
  banner_url: z.string().url().optional().or(z.literal('')),
  is_public: z.boolean().default(true),
  slug: z.string().min(2, 'Slug too short').optional(),
});

type FormValues = z.infer<typeof schema>;

export function MerchantProfileForm({
  initial,
}: {
  initial?: Partial<Merchant>;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      display_name: initial?.display_name || '',
      bio: initial?.bio || '',
      location: initial?.location || '',
      languages: initial?.languages?.join(', ') || '',
      website: initial?.socials?.website || '',
      twitter: initial?.socials?.twitter || '',
      telegram: initial?.socials?.telegram || '',
      avatar_url: initial?.avatar_url || '',
      banner_url: initial?.banner_url || '',
      is_public: initial?.is_public ?? true,
      slug: initial?.slug || '',
    },
  });

  const upsert = useUpsertMerchantProfile();

  async function onSubmit(values: FormValues) {
    const payload = {
      display_name: values.display_name,
      bio: values.bio?.trim() || undefined,
      location: values.location?.trim() || undefined,
      languages: values.languages
        ? values.languages
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      socials: {
        website: values.website || undefined,
        twitter: values.twitter || undefined,
        telegram: values.telegram || undefined,
      },
      avatar_url: values.avatar_url || undefined,
      banner_url: values.banner_url || undefined,
      is_public: values.is_public,
      slug: values.slug || undefined,
    };
    await upsert.mutateAsync(payload);
    toast.success('Profile saved');
  }

  return (
    <Card className="feature-card-dark rounded-2xl p-4 sm:p-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 sm:grid-cols-2"
        >
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input placeholder="Your merchant name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="Short description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="City, Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="languages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Languages</FormLabel>
                <FormControl>
                  <Input placeholder="es, en" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://twitter.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telegram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telegram URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://t.me/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatar_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="banner_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                <div>
                  <FormLabel>Public Profile</FormLabel>
                  <div className="text-xs text-muted-foreground">
                    Make your page visible at /m/[slug]
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="demo-merchant" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

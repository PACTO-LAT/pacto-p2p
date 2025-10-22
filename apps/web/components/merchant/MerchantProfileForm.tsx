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
import { useCrossmint } from '@/hooks/use-crossmint';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { countries as countriesData } from 'countries-list';

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
  const { isWalletConnected: isConnected, login: handleConnect } = useCrossmint();
  const [avatarPreview, setAvatarPreview] = useState<string>(
    initial?.avatar_url || ''
  );
  const [bannerPreview, setBannerPreview] = useState<string>(
    initial?.banner_url || ''
  );
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
    if (!isConnected) {
      toast.error('Connect your wallet to save your merchant profile');
      return;
    }
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
      {!isConnected ? (
        <div className="mb-4 flex items-center justify-between rounded-lg border p-3">
          <div>
            <div className="font-medium">Wallet not connected</div>
            <div className="text-xs text-muted-foreground">
              Connect your Stellar wallet to create or update your merchant
              profile.
            </div>
          </div>
          <Button type="button" variant="default" onClick={handleConnect}>
            Connect Wallet
          </Button>
        </div>
      ) : null}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4 sm:grid-cols-2"
        >
          {/* Avatar uploader */}
          <div className="sm:col-span-2">
            <Label className="mb-2 block">Profile picture</Label>
            <div className="flex items-center gap-3">
              <div className="size-16 overflow-hidden rounded-md border relative">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const path = `avatars/${crypto.randomUUID()}-${file.name}`;
                    const { error } = await supabase.storage
                      .from('merchant-media')
                      .upload(path, file, { upsert: true });
                    if (error) throw error;
                    const { data } = supabase.storage
                      .from('merchant-media')
                      .getPublicUrl(path);
                    form.setValue('avatar_url', data.publicUrl);
                    setAvatarPreview(data.publicUrl);
                    toast.success('Avatar uploaded');
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to upload avatar');
                  }
                }}
              />
              {avatarPreview ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    form.setValue('avatar_url', '');
                    setAvatarPreview('');
                  }}
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>

          {/* Banner uploader */}
          <div className="sm:col-span-2">
            <Label className="mb-2 block">Banner image</Label>
            <div className="flex items-center gap-3">
              <div className="h-20 w-64 overflow-hidden rounded-md border relative">
                {bannerPreview ? (
                  <Image
                    src={bannerPreview}
                    alt="Banner preview"
                    fill
                    sizes="256px"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const path = `banners/${crypto.randomUUID()}-${file.name}`;
                    const { error } = await supabase.storage
                      .from('merchant-media')
                      .upload(path, file, { upsert: true });
                    if (error) throw error;
                    const { data } = supabase.storage
                      .from('merchant-media')
                      .getPublicUrl(path);
                    form.setValue('banner_url', data.publicUrl);
                    setBannerPreview(data.publicUrl);
                    toast.success('Banner uploaded');
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to upload banner');
                  }
                }}
              />
              {bannerPreview ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    form.setValue('banner_url', '');
                    setBannerPreview('');
                  }}
                >
                  <X className="size-4" />
                </Button>
              ) : null}
            </div>
          </div>

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
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <div>
                    <Select
                      value={field.value}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryOptions.map((c) => (
                          <SelectItem key={c.code} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <TagsInput
                    value={field.value}
                    onChange={(v) => field.onChange(v)}
                    placeholder="Add languages (e.g. English, Spanish)"
                  />
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
            <Button type="submit" disabled={upsert.isPending || !isConnected}>
              {upsert.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}

// Build country options from countries-list
const countryOptions = Object.entries(countriesData)
  .map(([code, c]) => ({ code, name: c.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Lightweight tags input for languages
function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const tags = useMemo(
    () =>
      value
        ? value
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    [value]
  );

  function addTag(t: string) {
    const next = Array.from(new Set([...tags, t.trim()])).filter(Boolean);
    onChange(next.join(', '));
  }

  function removeTag(t: string) {
    const next = tags.filter((x) => x.toLowerCase() !== t.toLowerCase());
    onChange(next.join(', '));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs"
          >
            {t}
            <button
              type="button"
              className="hover:text-foreground"
              onClick={() => removeTag(t)}
              aria-label={`Remove ${t}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <Input
        className="mt-2"
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const input = (e.target as HTMLInputElement).value.trim();
            if (input) {
              addTag(input);
              (e.target as HTMLInputElement).value = '';
            }
          }
        }}
      />
    </div>
  );
}

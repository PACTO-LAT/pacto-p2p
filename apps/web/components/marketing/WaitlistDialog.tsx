'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { sileo } from 'sileo';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
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
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const waitlistSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  company: z.string().optional().or(z.literal('')),
  role: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
  source: z.string().optional().or(z.literal('')),
  use_case: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

type WaitlistDialogProps = {
  triggerClassName?: string;
  triggerText?: string;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function WaitlistDialogInner({
  triggerClassName,
  triggerText = 'Join the waitlist',
}: WaitlistDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmHandled = useRef(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      role: '',
      country: '',
      source: '',
      use_case: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (searchParams.get('waitlist_confirm') !== '1') return;
    if (confirmHandled.current) return;

    let cancelled = false;

    async function confirmWaitlist(accessToken: string) {
      if (confirmHandled.current || cancelled) return;
      confirmHandled.current = true;

      try {
        const res = await fetch('/api/waitlist/confirm', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();

        if (res.ok && data?.ok) {
          sileo.success({
            title: "You're on the waitlist — email verified",
          });
        } else if (res.status === 404) {
          sileo.error({
            title: 'Waitlist entry not found',
            description:
              'Please join the waitlist first, then verify with Google using the same email.',
          });
        } else {
          sileo.error({
            title: 'Verification failed',
            description: data?.error || 'Please try again.',
          });
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unknown error';
        sileo.error({ title: 'Verification failed', description: message });
      } finally {
        router.replace('/', { scroll: false });
      }
    }

    async function attemptConfirm() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        await confirmWaitlist(session.access_token);
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.access_token) {
          subscription.unsubscribe();
          void confirmWaitlist(session.access_token);
        }
      });

      return () => subscription.unsubscribe();
    }

    const cleanupPromise = attemptConfirm();
    return () => {
      cancelled = true;
      void cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [searchParams, router]);

  async function onSubmit(values: WaitlistFormValues) {
    try {
      const res = await fetch('/api/waitlist/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        sileo.error({
          title: 'Failed to join waitlist',
          description: data?.error || 'Unknown error',
        });
        return;
      }

      setPendingEmail(values.email);
      setStep('verify');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      sileo.error({ title: 'Unexpected error', description: message });
    }
  }

  async function onVerifyWithGoogle() {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/?waitlist_confirm=1`,
        },
      });
      if (error) throw error;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Google sign-in failed';
      sileo.error({ title: message });
      setIsGoogleLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn('btn-waitlist text-accent', triggerClassName)}>
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join the waitlist</DialogTitle>
          <DialogDescription>
            Tell us a bit about you so we can prioritize access.
          </DialogDescription>
        </DialogHeader>
        {step === 'form' ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Company name (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="merchant">Merchant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="Where are you based?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did you hear about us?</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Twitter, Friend, Search"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="use_case"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Primary use case</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="What would you use Pacto for?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Anything else you'd like to add?"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  className="btn-waitlist text-accent !h-11 !py-1"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-primary !h-11 !py-1"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? 'Submitting…'
                    : 'Join waitlist'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Verify your email by signing in with Google. Use the same Google
                account as{' '}
                <span className="font-medium text-foreground">
                  {pendingEmail}
                </span>
                .
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="btn-waitlist text-accent !h-11 !py-1"
                onClick={() => setStep('form')}
              >
                Back
              </Button>
              <Button
                type="button"
                className="btn-primary !h-11 !py-1"
                disabled={isGoogleLoading}
                onClick={onVerifyWithGoogle}
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                {isGoogleLoading ? 'Redirecting…' : 'Verify with Google'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function WaitlistDialog(props: WaitlistDialogProps) {
  return (
    <Suspense fallback={null}>
      <WaitlistDialogInner {...props} />
    </Suspense>
  );
}

export default WaitlistDialog;

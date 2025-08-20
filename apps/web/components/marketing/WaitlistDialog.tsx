'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

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
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export function WaitlistDialog({ triggerClassName, triggerText = 'Join the waitlist' }: WaitlistDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otp, setOtp] = useState('');
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

  async function onSubmit(values: WaitlistFormValues) {
    try {
      const res = await fetch('/api/waitlist/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Failed to join waitlist', {
          description: data?.error || 'Unknown error',
        });
        return;
      }

      setPendingEmail(values.email);
      setStep('otp');
      toast.success('Check your email for a verification code', {
        description: 'Enter the 6-digit code to confirm your registration.',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Unexpected error', { description: message });
    }
  }

  async function onVerifyOtp() {
    if (!pendingEmail || otp.length !== 6) return;
    try {
      const res = await fetch('/api/waitlist/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error('Invalid or expired code', {
          description: data?.error || 'Try again or request a new code.',
        });
        return;
      }
      toast.success('You are on the waitlist!', {
        description: 'Verification complete. We’ll reach out as slots open up.',
      });
      setTimeout(() => {
        setOpen(false);
        setStep('form');
        setOtp('');
        setPendingEmail('');
        form.reset();
      }, 1200);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Unexpected error', { description: message });
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
                      <Input placeholder="Company name (optional)" {...field} />
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  {form.formState.isSubmitting ? 'Submitting…' : 'Join waitlist'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">We sent a 6-digit code to</div>
              <div className="font-medium">{pendingEmail}</div>
            </div>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="gap-2">
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-12 w-12 text-lg md:h-14 md:w-14 md:text-xl" />
                  <InputOTPSlot index={1} className="h-12 w-12 text-lg md:h-14 md:w-14 md:text-xl" />
                  <InputOTPSlot index={2} className="h-12 w-12 text-lg md:h-14 md:w-14 md:text-xl" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} className="h-12 w-12 text-lg md:h-14 md:w-14 md:text-xl" />
                  <InputOTPSlot index={4} className="h-12 w-12 text-lg md:h-14 md:w-14 md:text-xl" />
                  <InputOTPSlot index={5} className="h-12 w-12 text-lg md:h-14 md:w-14 md:text-xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="btn-waitlist text-accent !h-11 !py-1"
                onClick={() => {
                  setStep('form');
                  setOtp('');
                }}
              >
                Back
              </Button>
              <Button
                type="button"
                className="btn-primary !h-11 !py-1"
                disabled={otp.length !== 6}
                onClick={onVerifyOtp}
              >
                Verify
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default WaitlistDialog;

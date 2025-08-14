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
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';

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

export function WaitlistDialog() {
  const [open, setOpen] = useState(false);
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
      const { error } = await supabase.from('waitlist_submissions').insert([
        {
          name: values.name,
          email: values.email,
          company: values.company || null,
          role: values.role || null,
          country: values.country || null,
          source: values.source || null,
          use_case: values.use_case || null,
          notes: values.notes || null,
        },
      ]);

      if (error) {
        toast.error('Failed to join waitlist', {
          description: error.message,
        });
        return;
      }

      toast.success('You are on the waitlist!', {
        description: 'We will reach out as soon as slots open up.',
      });
      // Close dialog after a short delay so user can see the success message
      setTimeout(() => {
        setOpen(false);
        form.reset();
      }, 1500);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Unexpected error', { description: message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-primary text-lg px-8 py-3 text-accent">
          Join the waitlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join the waitlist</DialogTitle>
          <DialogDescription>
            Tell us a bit about you so we can prioritize access.
          </DialogDescription>
        </DialogHeader>
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
                    <FormControl>
                      <Input placeholder="Your role (optional)" {...field} />
                    </FormControl>
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
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Submitting…' : 'Join waitlist'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default WaitlistDialog;

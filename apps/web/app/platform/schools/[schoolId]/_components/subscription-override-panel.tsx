'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { DatePicker } from '@kit/ui/date-picker';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { PlatformSectionCard } from '~/components/platform-console';
import { PlatformOverrideSubscriptionSchema } from '~/lib/kinder/platform/schemas/package.schema';
import { platformOverrideSubscriptionAction } from '~/lib/kinder/platform/platform-ops-actions';
import type { PlatformSchoolDetail } from '~/lib/kinder/platform/types';
import type { Package } from '~/lib/kinder/types';

export function SubscriptionOverridePanel({
  school,
  packages,
}: {
  school: PlatformSchoolDetail;
  packages: Package[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(PlatformOverrideSubscriptionSchema),
    defaultValues: {
      schoolId: school.id,
      packageId: school.package_id ?? packages[0]?.id ?? '',
      status: (school.subscription_status as 'trial' | 'active' | 'past_due' | 'cancelled') ?? 'active',
      trialEndsAt: school.trial_ends_at
        ? new Date(school.trial_ends_at).toISOString().slice(0, 10)
        : '',
      note: '',
    },
  });

  return (
    <PlatformSectionCard title={<Trans i18nKey="kinder:platform.subscription.overrideTitle" />}>
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              await platformOverrideSubscriptionAction(values);
              router.refresh();
            });
          })}
        >
          <FormField
            control={form.control}
            name="packageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:platform.schools.package" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} ({pkg.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="past_due">Past due</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="trialEndsAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trial ends</FormLabel>
                <FormControl>
                  <DatePicker
                    className="w-full"
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={pending} type="submit">
            <Trans i18nKey="kinder:platform.subscription.save" />
          </Button>
        </form>
      </Form>
    </PlatformSectionCard>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { UpdateSchoolSchema } from '~/lib/kinder/tenant/schemas/school.schema';
import { updateSchoolAction } from '~/lib/kinder/tenant/server-actions';
import type { School } from '~/lib/kinder/types';

export function UpdateSchoolForm({ school }: { school: School }) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(UpdateSchoolSchema),
    defaultValues: {
      schoolId: school.id,
      name: school.name,
      phone: school.phone ?? '',
      email: school.email ?? '',
      address: school.address ?? '',
      logoUrl: school.logo_url ?? '',
      themePrimaryColor: school.theme_primary_color ?? '',
      customDomain: school.custom_domain ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const promise = updateSchoolAction(data);

    toast.promise(promise, {
      loading: t('schoolSettings.saving'),
      success: t('schoolSettings.saved'),
      error: t('common:genericServerError', { ns: 'common' }),
    });

    await promise;
  });

  return (
    <Form {...form}>
      <form className="flex max-w-xl flex-col gap-4" onSubmit={onSubmit}>
        <input name="schoolId" type="hidden" value={school.id} />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:schoolSettings.name" />
              </FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:schoolSettings.phone" />
              </FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>
                <Trans i18nKey="kinder:schoolSettings.email" />
              </FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:schoolSettings.address" />
              </FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:schoolSettings.logoUrl" />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="themePrimaryColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:schoolSettings.themeColor" />
              </FormLabel>
              <FormControl>
                <Input placeholder="#2563eb" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customDomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:schoolSettings.customDomain" />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          <Trans i18nKey="kinder:schoolSettings.save" />
        </Button>
      </form>
    </Form>
  );
}

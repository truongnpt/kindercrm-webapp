'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { CreateSchoolSchema } from '~/lib/kinder/tenant/schemas/school.schema';
import { createSchoolAction } from '~/lib/kinder/tenant/server-actions';
import { slugifySchoolName } from '~/lib/kinder/tenant/slugify';

export function CreateSchoolForm() {
  const { t } = useTranslation('kinder');
  const [slugTouched, setSlugTouched] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateSchoolSchema),
    defaultValues: {
      name: '',
      slug: '',
      phone: '',
      email: '',
      address: '',
      campusName: 'Cơ sở chính',
    },
  });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((data) => createSchoolAction(data))}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:onboarding.schoolName" />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);

                    if (!slugTouched) {
                      form.setValue('slug', slugifySchoolName(event.target.value));
                    }
                  }}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:onboarding.schoolSlug" />
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(event) => {
                    setSlugTouched(true);
                    field.onChange(event);
                  }}
                  required
                />
              </FormControl>
              <FormDescription>
                <Trans i18nKey="kinder:onboarding.schoolSlugHint" />
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="campusName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:onboarding.campusName" />
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
                <Trans i18nKey="kinder:onboarding.phone" />
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
                <Trans i18nKey="kinder:onboarding.email" />
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
                <Trans i18nKey="kinder:onboarding.address" />
              </FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit">
          {t('onboarding.submit')}
        </Button>
      </form>
    </Form>
  );
}

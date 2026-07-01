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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { CreateCampusSchema } from '~/lib/kinder/tenant/schemas/campus.schema';
import { createCampusAction } from '~/lib/kinder/tenant/server-actions';
import type { Campus } from '~/lib/kinder/types';

export function CreateCampusForm({
  schoolId,
  campuses,
}: {
  schoolId: string;
  campuses: Campus[];
}) {
  const { t } = useTranslation('kinder');
  const mainCampuses = campuses.filter((c) => c.campus_type === 'campus');

  const form = useForm({
    resolver: zodResolver(CreateCampusSchema),
    defaultValues: {
      schoolId,
      name: '',
      campusType: 'campus' as const,
      parentCampusId: '',
      address: '',
      phone: '',
      isMain: false,
    },
  });

  const campusType = form.watch('campusType');

  const onSubmit = form.handleSubmit(async (data) => {
    const promise = createCampusAction(data);

    toast.promise(promise, {
      loading: t('campuses.creating'),
      success: t('campuses.created'),
      error: t('common:genericServerError', { ns: 'common' }),
    });

    await promise;
    form.reset({
      schoolId,
      name: '',
      campusType: 'campus',
      parentCampusId: '',
      address: '',
      phone: '',
      isMain: false,
    });
  });

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4 rounded-lg border p-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="campusType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:campuses.type" />
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="campus">
                    <Trans i18nKey="kinder:campuses.typeCampus" />
                  </SelectItem>
                  <SelectItem value="branch">
                    <Trans i18nKey="kinder:campuses.typeBranch" />
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {campusType === 'branch' && mainCampuses.length > 0 ? (
          <FormField
            control={form.control}
            name="parentCampusId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:campuses.parentCampus" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mainCampuses.map((campus) => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:campuses.name" />
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
                <Trans i18nKey="kinder:campuses.phone" />
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:campuses.address" />
              </FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          <Trans i18nKey="kinder:campuses.create" />
        </Button>
      </form>
    </Form>
  );
}

'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { CreateCampusSchema } from '~/lib/kinder/tenant/schemas/campus.schema';
import { createCampusAction } from '~/lib/kinder/tenant/server-actions';
import { formatQuotaMutationError } from '~/lib/kinder/subscription/quota-limit-messages';
import type { QuotaFormSummary } from '~/lib/kinder/subscription/quotas';
import type { Campus } from '~/lib/kinder/types';

import { QuotaLimitBanner } from '../../../_components/quota-limit-banner';

export function CreateCampusDialog({
  schoolId,
  campuses,
  quotaSummary,
}: {
  schoolId: string;
  campuses: Campus[];
  quotaSummary: QuotaFormSummary;
}) {
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);
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

  const createCampus = useKinderMutation({
    mutationFn: createCampusAction,
    invalidateKeys: [kinderQueryKeys.settings.campuses(schoolId)],
    toast: {
      loading: t('campuses.creating'),
      success: t('campuses.created'),
      error: (error) =>
        formatQuotaMutationError(t, error, quotaSummary) ?? t('ui.toast.error'),
    },
    onSuccess: () => {
      form.reset({
        schoolId,
        name: '',
        campusType: 'campus',
        parentCampusId: '',
        address: '',
        phone: '',
        isMain: false,
      });
      setOpen(false);
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:campuses.description" />}
      onOpenChange={setOpen}
      open={open}
      size="md"
      title={<Trans i18nKey="kinder:campuses.addCampus" />}
      trigger={
        <Button disabled={quotaSummary.campuses.atLimit}>
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:campuses.addCampus" />
        </Button>
      }
      footer={
        <KinderSubmitButton
          disabled={quotaSummary.campuses.atLimit}
          loading={createCampus.isPending}
          onClick={form.handleSubmit((data) => createCampus.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:campuses.create" />
        </KinderSubmitButton>
      }
    >
      <QuotaLimitBanner
        atLimit={quotaSummary.campuses.atLimit}
        currentPackageName={quotaSummary.currentPackageName}
        kind="campuses"
        max={quotaSummary.limits.maxCampuses}
        nearLimit={quotaSummary.campuses.nearLimit}
        suggestedPackageName={quotaSummary.campuses.suggestedPackageName}
        used={quotaSummary.usage.campuses}
      />
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="campusType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:campuses.type" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
        </form>
      </Form>
    </KinderFormDialog>
  );
}

'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  useKinderMutation,
} from '~/components/kinder-ui';
import { submitEnterpriseInquiryAction } from '~/lib/kinder/subscription/enterprise-inquiry-actions';
import { SubmitEnterpriseInquirySchema } from '~/lib/kinder/subscription/schemas/enterprise-inquiry.schema';

export function EnterpriseInquiryDialog({
  schoolId,
  isOwner,
  triggerClassName,
}: {
  schoolId: string;
  isOwner: boolean;
  triggerClassName?: string;
}) {
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(SubmitEnterpriseInquirySchema),
    defaultValues: {
      schoolId,
      contactName: '',
      phone: '',
      campusCount: 1,
      notes: '',
    },
  });

  const submitInquiry = useKinderMutation({
    mutationFn: submitEnterpriseInquiryAction,
    toast: {
      loading: t('subscription.enterpriseInquiry.submitting'),
      success: t('subscription.enterpriseInquiry.submitted'),
      error: t('ui.toast.error'),
    },
    onSuccess: () => {
      form.reset({
        schoolId,
        contactName: '',
        phone: '',
        campusCount: 1,
        notes: '',
      });
      setOpen(false);
    },
  });

  if (!isOwner) {
    return (
      <Button className={triggerClassName ?? 'w-full'} disabled variant="outline">
        <Trans i18nKey="kinder:subscription.enterpriseContact" />
      </Button>
    );
  }

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:subscription.enterpriseInquiry.description" />}
      onOpenChange={setOpen}
      open={open}
      size="md"
      title={<Trans i18nKey="kinder:subscription.enterpriseInquiry.title" />}
      trigger={
        <Button className={triggerClassName ?? 'w-full'} type="button" variant="outline">
          <Mail className="mr-2 size-4" />
          <Trans i18nKey="kinder:subscription.enterpriseContact" />
        </Button>
      }
      footer={
        <KinderSubmitButton
          loading={submitInquiry.isPending}
          onClick={form.handleSubmit((data) => submitInquiry.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:subscription.enterpriseInquiry.submit" />
        </KinderSubmitButton>
      }
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:subscription.enterpriseInquiry.contactName" />
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
                  <Trans i18nKey="kinder:subscription.enterpriseInquiry.phone" />
                </FormLabel>
                <FormControl>
                  <Input inputMode="tel" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="campusCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:subscription.enterpriseInquiry.campusCount" />
                </FormLabel>
                <FormControl>
                  <Input min={1} type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:subscription.enterpriseInquiry.notes" />
                </FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
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

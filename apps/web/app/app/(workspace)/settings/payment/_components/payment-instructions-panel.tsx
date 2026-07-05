'use client';

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
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { UpdatePaymentInstructionsSchema } from '~/lib/kinder/payment-settings/schemas/payment-settings.schema';
import { updatePaymentInstructionsAction } from '~/lib/kinder/payment-settings/server-actions';
import type { PaymentInstructions } from '~/lib/kinder/payment-settings/types';

export function PaymentInstructionsPanel({
  schoolId,
  instructions,
}: {
  schoolId: string;
  instructions: PaymentInstructions | null;
}) {
  const form = useForm({
    resolver: zodResolver(UpdatePaymentInstructionsSchema),
    defaultValues: {
      schoolId,
      title: instructions?.title ?? 'Payment instructions',
      description: instructions?.description ?? '',
      imageUrl: instructions?.image_url ?? '',
      videoUrl: instructions?.video_url ?? '',
      notes: instructions?.notes ?? '',
    },
  });

  return (
    <Form {...form}>
      <form
        className="mx-auto max-w-2xl space-y-4"
        onSubmit={form.handleSubmit(async (data) => {
          await updatePaymentInstructionsAction(data);
        })}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:paymentSettings.instructionsTitle" />
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:paymentSettings.instructionsBody" />
              </FormLabel>
              <FormControl>
                <Textarea {...field} rows={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:paymentSettings.imageUrl" />
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://" type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:paymentSettings.videoUrl" />
                </FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://" type="url" />
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
              <FormLabel>
                <Trans i18nKey="kinder:paymentSettings.notes" />
              </FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full sm:w-auto" type="submit">
          <Trans i18nKey="common:save" />
        </Button>
      </form>
    </Form>
  );
}

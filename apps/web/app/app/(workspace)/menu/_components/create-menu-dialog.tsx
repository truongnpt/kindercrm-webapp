'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { CreateMenuSchema } from '~/lib/kinder/meal-menu/schemas/meal-menu.schema';
import { createMenuAction } from '~/lib/kinder/meal-menu/server-actions';

function defaultDates() {
  const start = new Date();
  const end = new Date(Date.now() + 6 * 86400000);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export function CreateMenuDialog({ schoolId }: { schoolId: string }) {
  const [open, setOpen] = useState(false);
  const dates = defaultDates();

  const form = useForm({
    resolver: zodResolver(CreateMenuSchema),
    defaultValues: {
      schoolId,
      title: '',
      periodType: 'weekly' as const,
      startDate: dates.startDate,
      endDate: dates.endDate,
      notes: '',
    },
  });

  const createMenu = useKinderMutation({
    mutationFn: createMenuAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    onSuccess: () => {
      const nextDates = defaultDates();
      form.reset({
        schoolId,
        title: '',
        periodType: 'weekly',
        startDate: nextDates.startDate,
        endDate: nextDates.endDate,
        notes: '',
      });
      setOpen(false);
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:mealMenu.createMenuDescription" />}
      footer={
        <KinderSubmitButton
          loading={createMenu.isPending}
          onClick={form.handleSubmit((data) => createMenu.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:mealMenu.createMenu" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:mealMenu.createMenu" />}
      trigger={
        <Button type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:mealMenu.createMenu" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:mealMenu.menuTitle" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="periodType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:mealMenu.periodType" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">
                      <Trans i18nKey="kinder:mealMenu.periodTypes.daily" />
                    </SelectItem>
                    <SelectItem value="weekly">
                      <Trans i18nKey="kinder:mealMenu.periodTypes.weekly" />
                    </SelectItem>
                    <SelectItem value="monthly">
                      <Trans i18nKey="kinder:mealMenu.periodTypes.monthly" />
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:mealMenu.startDate" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:mealMenu.endDate" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
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
                  <Trans i18nKey="kinder:crm.notes" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </KinderFormDialog>
  );
}

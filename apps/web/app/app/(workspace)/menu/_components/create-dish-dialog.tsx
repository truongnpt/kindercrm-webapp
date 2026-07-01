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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { UpsertDishSchema } from '~/lib/kinder/meal-menu/schemas/meal-menu.schema';
import { upsertDishAction } from '~/lib/kinder/meal-menu/server-actions';

export function CreateDishDialog({ schoolId }: { schoolId: string }) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(UpsertDishSchema),
    defaultValues: {
      schoolId,
      name: '',
      description: '',
      allergenTags: [] as string[],
    },
  });

  const createDish = useKinderMutation({
    mutationFn: upsertDishAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    onSuccess: () => {
      form.reset({ schoolId, name: '', description: '', allergenTags: [] });
      setOpen(false);
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:mealMenu.addDishDescription" />}
      footer={
        <KinderSubmitButton
          loading={createDish.isPending}
          onClick={form.handleSubmit((data) => createDish.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:mealMenu.addDish" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      title={<Trans i18nKey="kinder:mealMenu.addDish" />}
      trigger={
        <Button className="rounded-lg" size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:mealMenu.addDish" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:mealMenu.dishName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
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

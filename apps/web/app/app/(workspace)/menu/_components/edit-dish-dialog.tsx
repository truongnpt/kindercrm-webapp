'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
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
import type { Dish } from '~/lib/kinder/meal-menu/types';

export function EditDishDialog({
  dish,
  schoolId,
  open: controlledOpen,
  onOpenChange,
  hideTrigger,
}: {
  dish: Dish;
  schoolId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm({
    resolver: zodResolver(UpsertDishSchema),
    defaultValues: {
      id: dish.id,
      schoolId,
      name: dish.name,
      description: dish.description ?? '',
      allergenTags: dish.allergen_tags,
    },
  });

  useEffect(() => {
    form.reset({
      id: dish.id,
      schoolId,
      name: dish.name,
      description: dish.description ?? '',
      allergenTags: dish.allergen_tags,
    });
  }, [dish, form, schoolId]);

  const updateDish = useKinderMutation({
    mutationFn: upsertDishAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    onSuccess: () => setOpen(false),
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:mealMenu.editDishDescription" />}
      footer={
        <KinderSubmitButton
          loading={updateDish.isPending}
          onClick={form.handleSubmit((data) => updateDish.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:ui.saveChanges" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      title={<Trans i18nKey="kinder:mealMenu.editDish" />}
      trigger={
        hideTrigger ? undefined : (
          <Button size="sm" type="button" variant="outline">
            <Pencil className="mr-2 size-4" />
            <Trans i18nKey="kinder:ui.edit" />
          </Button>
        )
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

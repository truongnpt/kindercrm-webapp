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
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';
import { UpsertIngredientSchema } from '~/lib/kinder/meal-menu/schemas/meal-menu.schema';
import { upsertIngredientAction } from '~/lib/kinder/meal-menu/server-actions';

export function CreateIngredientDialog({
  schoolId,
  inventoryProducts = [],
}: {
  schoolId: string;
  inventoryProducts?: InventoryProductWithStock[];
}) {
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(UpsertIngredientSchema),
    defaultValues: {
      schoolId,
      name: '',
      unit: 'g',
      allergenTags: [] as string[],
      notes: '',
      inventoryProductId: '',
    },
  });

  const createIngredient = useKinderMutation({
    mutationFn: upsertIngredientAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        name: '',
        unit: 'g',
        allergenTags: [],
        notes: '',
        inventoryProductId: '',
      });
      setOpen(false);
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:mealMenu.addIngredientDescription" />}
      footer={
        <KinderSubmitButton
          loading={createIngredient.isPending}
          onClick={form.handleSubmit((data) =>
            createIngredient.mutate({
              ...data,
              inventoryProductId:
                data.inventoryProductId === '__none__' ?
                  ''
                : data.inventoryProductId,
            }),
          )}
          type="button"
        >
          <Trans i18nKey="kinder:mealMenu.addIngredient" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      title={<Trans i18nKey="kinder:mealMenu.addIngredient" />}
      trigger={
        <Button className="rounded-lg" size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:mealMenu.addIngredient" />
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
                  <Trans i18nKey="kinder:mealMenu.ingredientName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:mealMenu.unit" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          {inventoryProducts.length > 0 ? (
            <FormField
              control={form.control}
              name="inventoryProductId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:mealMenu.linkInventoryProduct" />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('mealMenu.selectInventoryProduct')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">
                        <Trans i18nKey="kinder:mealMenu.noInventoryLink" />
                      </SelectItem>
                      {inventoryProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          ) : null}
        </form>
      </Form>
    </KinderFormDialog>
  );
}

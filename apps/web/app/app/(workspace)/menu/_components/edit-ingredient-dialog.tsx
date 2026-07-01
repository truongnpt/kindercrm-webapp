'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
import type { Ingredient } from '~/lib/kinder/meal-menu/types';

export function EditIngredientDialog({
  ingredient,
  schoolId,
  inventoryProducts = [],
  open: controlledOpen,
  onOpenChange,
}: {
  ingredient: Ingredient;
  schoolId: string;
  inventoryProducts?: InventoryProductWithStock[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useTranslation('kinder');
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm({
    resolver: zodResolver(UpsertIngredientSchema),
    defaultValues: {
      id: ingredient.id,
      schoolId,
      name: ingredient.name,
      unit: ingredient.unit,
      allergenTags: ingredient.allergen_tags,
      notes: ingredient.notes ?? '',
      inventoryProductId: ingredient.inventory_product_id ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      id: ingredient.id,
      schoolId,
      name: ingredient.name,
      unit: ingredient.unit,
      allergenTags: ingredient.allergen_tags,
      notes: ingredient.notes ?? '',
      inventoryProductId: ingredient.inventory_product_id ?? '',
    });
  }, [form, ingredient, schoolId]);

  const updateIngredient = useKinderMutation({
    mutationFn: upsertIngredientAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    onSuccess: () => setOpen(false),
  });

  return (
    <KinderFormDialog
      description={
        <Trans i18nKey="kinder:mealMenu.editIngredientDescription" />
      }
      footer={
        <KinderSubmitButton
          loading={updateIngredient.isPending}
          onClick={form.handleSubmit((data) =>
            updateIngredient.mutate({
              ...data,
              inventoryProductId:
                data.inventoryProductId === '__none__' ?
                  ''
                : data.inventoryProductId,
            }),
          )}
          type="button"
        >
          <Trans i18nKey="kinder:ui.saveChanges" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      title={<Trans i18nKey="kinder:mealMenu.editIngredient" />}
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
                    value={field.value || '__none__'}
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

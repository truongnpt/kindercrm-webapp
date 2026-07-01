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

import { UpsertIngredientSchema } from '~/lib/kinder/meal-menu/schemas/meal-menu.schema';
import { PanelEmpty } from '~/components/kinder-ui';
import { upsertIngredientAction } from '~/lib/kinder/meal-menu/server-actions';
import type { Ingredient } from '~/lib/kinder/meal-menu/types';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';

export function IngredientsPanel({
  schoolId,
  ingredients,
  inventoryProducts = [],
}: {
  schoolId: string;
  ingredients: Ingredient[];
  inventoryProducts?: InventoryProductWithStock[];
}) {
  const { t } = useTranslation('kinder');

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

  return (
    <div className="space-y-6">
      {ingredients.length === 0 ? (
        <PanelEmpty messageKey="kinder:mealMenu.emptyIngredients" />
      ) : (
        <ul className="kinder-list-panel">
          {ingredients.map((ingredient) => {
            const linkedProduct = inventoryProducts.find(
              (product) => product.id === ingredient.inventory_product_id,
            );

            return (
              <li className="p-4 text-sm" key={ingredient.id}>
                <p className="font-medium">{ingredient.name}</p>
                <p className="text-muted-foreground text-xs">
                  {ingredient.unit}
                  {ingredient.allergen_tags.length > 0
                    ? ` · ${ingredient.allergen_tags.join(', ')}`
                    : ''}
                  {linkedProduct
                    ? ` · Kho: ${linkedProduct.name} (${linkedProduct.quantity} ${linkedProduct.unit})`
                    : ''}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <Form {...form}>
        <form
          className="kinder-form-panel max-w-xl grid-cols-1"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertIngredientAction({
              ...data,
              inventoryProductId:
                data.inventoryProductId === '__none__'
                  ? ''
                  : data.inventoryProductId,
            });
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              schoolId,
              name: '',
              unit: 'g',
              allergenTags: [],
              notes: '',
              inventoryProductId: '',
            });
          })}
        >
          <p className="font-medium">
            <Trans i18nKey="kinder:mealMenu.addIngredient" />
          </p>
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
          <Button type="submit">
            <Trans i18nKey="kinder:mealMenu.addIngredient" />
          </Button>
        </form>
      </Form>
    </div>
  );
}

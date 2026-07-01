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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { UpsertDishSchema } from '~/lib/kinder/meal-menu/schemas/meal-menu.schema';
import { PanelEmpty } from '~/components/kinder-ui';
import { upsertDishAction } from '~/lib/kinder/meal-menu/server-actions';
import type { Dish } from '~/lib/kinder/meal-menu/types';

export function DishesPanel({
  schoolId,
  dishes,
}: {
  schoolId: string;
  dishes: Dish[];
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(UpsertDishSchema),
    defaultValues: {
      schoolId,
      name: '',
      description: '',
      allergenTags: [] as string[],
    },
  });

  return (
    <div className="space-y-6">
      {dishes.length === 0 ? (
        <PanelEmpty messageKey="kinder:mealMenu.emptyDishes" />
      ) : (
        <ul className="kinder-list-panel">
          {dishes.map((dish) => (
            <li className="p-4 text-sm" key={dish.id}>
              <p className="font-medium">{dish.name}</p>
              {dish.description ? (
                <p className="text-muted-foreground mt-1">{dish.description}</p>
              ) : null}
              {dish.allergen_tags.length > 0 ? (
                <p className="text-muted-foreground mt-1 text-xs">
                  <Trans i18nKey="kinder:mealMenu.allergens" />:{' '}
                  {dish.allergen_tags.join(', ')}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form
          className="kinder-form-panel max-w-xl grid-cols-1"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertDishAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({ schoolId, name: '', description: '', allergenTags: [] });
          })}
        >
          <p className="font-medium">
            <Trans i18nKey="kinder:mealMenu.addDish" />
          </p>
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
                  <Textarea {...field} rows={2} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">
            <Trans i18nKey="kinder:mealMenu.addDish" />
          </Button>
        </form>
      </Form>
    </div>
  );
}

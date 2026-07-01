'use client';

import { useState } from 'react';

import { UtensilsCrossed } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  EntityRowActions,
  KinderConfirmDialog,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { deleteDishAction } from '~/lib/kinder/meal-menu/server-actions';
import type { Dish } from '~/lib/kinder/meal-menu/types';

import { EditDishDialog } from './edit-dish-dialog';

export function DishesList({
  dishes,
  schoolId,
}: {
  dishes: Dish[];
  schoolId: string;
}) {
  const [editDish, setEditDish] = useState<Dish | null>(null);
  const [deleteDish, setDeleteDish] = useState<Dish | null>(null);

  const deleteMutation = useKinderMutation({
    mutationFn: deleteDishAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    onSuccess: () => setDeleteDish(null),
  });

  if (dishes.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:mealMenu.emptyDishesDescription"
        icon={UtensilsCrossed}
        titleKey="kinder:mealMenu.emptyDishes"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={<Trans i18nKey="kinder:mealMenu.dishesListDescription" />}
          title={<Trans i18nKey="kinder:mealMenu.tabs.dishes" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:mealMenu.dishName" />
                </th>
                <th>
                  <Trans i18nKey="kinder:crm.notes" />
                </th>
                <th>
                  <Trans i18nKey="kinder:mealMenu.allergens" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:mealMenu.actions" />
                </th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((dish) => (
                <tr key={dish.id}>
                  <td className="font-medium">{dish.name}</td>
                  <td className="text-muted-foreground max-w-xs truncate">
                    {dish.description || '—'}
                  </td>
                  <td className="text-muted-foreground">
                    {dish.allergen_tags.length > 0 ?
                      dish.allergen_tags.join(', ')
                    : '—'}
                  </td>
                  <td className="text-right">
                    <EntityRowActions
                      onDelete={() => setDeleteDish(dish)}
                      onEdit={() => setEditDish(dish)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {dishes.map((dish) => (
          <article className="kinder-mobile-card" key={dish.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{dish.name}</p>
                {dish.description ? (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {dish.description}
                  </p>
                ) : null}
                {dish.allergen_tags.length > 0 ? (
                  <p className="text-muted-foreground mt-2 text-xs">
                    <Trans i18nKey="kinder:mealMenu.allergens" />:{' '}
                    {dish.allergen_tags.join(', ')}
                  </p>
                ) : null}
              </div>
            </div>
            <EntityRowActions
              onDelete={() => setDeleteDish(dish)}
              onEdit={() => setEditDish(dish)}
            />
          </article>
        ))}
      </div>

      {editDish ? (
        <EditDishDialog
          dish={editDish}
          hideTrigger
          onOpenChange={(open) => {
            if (!open) {
              setEditDish(null);
            }
          }}
          open
          schoolId={schoolId}
        />
      ) : null}

      <KinderConfirmDialog
        confirmLabel={<Trans i18nKey="common:delete" />}
        description={<Trans i18nKey="kinder:ui.confirmDeleteDescription" />}
        onConfirm={() => {
          if (deleteDish) {
            deleteMutation.mutate({ schoolId, dishId: deleteDish.id });
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDish(null);
          }
        }}
        open={Boolean(deleteDish)}
        pending={deleteMutation.isPending}
        title={<Trans i18nKey="kinder:ui.confirmDelete" />}
      />
    </>
  );
}

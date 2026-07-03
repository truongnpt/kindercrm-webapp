'use client';

import { useState } from 'react';

import Link from 'next/link';

import { ChefHat } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  EntityRowActions,
  KinderConfirmDialog,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';
import { deleteIngredientAction } from '~/lib/kinder/meal-menu/server-actions';
import type { Ingredient } from '~/lib/kinder/meal-menu/types';

import { EditIngredientDialog } from './edit-ingredient-dialog';

export function IngredientsList({
  ingredients,
  inventoryProducts = [],
  schoolId,
}: {
  ingredients: Ingredient[];
  inventoryProducts?: InventoryProductWithStock[];
  schoolId: string;
}) {
  const [editIngredient, setEditIngredient] = useState<Ingredient | null>(null);
  const [deleteIngredient, setDeleteIngredient] = useState<Ingredient | null>(
    null,
  );

  const deleteMutation = useKinderMutation({
    mutationFn: deleteIngredientAction,
    invalidateKeys: [kinderQueryKeys.menu(schoolId)],
    onSuccess: () => setDeleteIngredient(null),
  });

  if (ingredients.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:mealMenu.emptyIngredientsDescription"
        icon={ChefHat}
        titleKey="kinder:mealMenu.emptyIngredients"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={
            <Trans i18nKey="kinder:mealMenu.ingredientsListDescription" />
          }
          title={<Trans i18nKey="kinder:mealMenu.tabs.ingredients" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:mealMenu.ingredientName" />
                </th>
                <th>
                  <Trans i18nKey="kinder:mealMenu.unit" />
                </th>
                <th>
                  <Trans i18nKey="kinder:mealMenu.allergens" />
                </th>
                <th>
                  <Trans i18nKey="kinder:mealMenu.linkInventoryProduct" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:mealMenu.actions" />
                </th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => {
                const linkedProduct = inventoryProducts.find(
                  (product) => product.id === ingredient.inventory_product_id,
                );

                return (
                  <tr key={ingredient.id}>
                    <td className="font-medium">{ingredient.name}</td>
                    <td className="text-muted-foreground">{ingredient.unit}</td>
                    <td className="text-muted-foreground">
                      {ingredient.allergen_tags.length > 0 ?
                        ingredient.allergen_tags.join(', ')
                      : '—'}
                    </td>
                    <td className="text-muted-foreground">
                      {linkedProduct ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span>
                            <Trans
                              i18nKey="kinder:mealMenu.inventoryStock"
                              values={{
                                name: linkedProduct.name,
                                quantity: linkedProduct.quantity,
                                unit: linkedProduct.unit,
                              }}
                            />
                          </span>
                          {linkedProduct.isLowStock ? (
                            <Badge variant="destructive">
                              <Trans i18nKey="kinder:inventory.lowStock" />
                            </Badge>
                          ) : null}
                          <Link
                            className="text-primary text-xs font-medium hover:underline"
                            href={
                              linkedProduct.isLowStock
                                ? `${pathsConfig.app.inventory}?tab=products&lowStock=1`
                                : `${pathsConfig.app.inventory}?tab=products`
                            }
                          >
                            <Trans i18nKey="kinder:mealMenu.viewInventory" />
                          </Link>
                        </div>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400">
                          <Trans i18nKey="kinder:mealMenu.noInventoryLinkHint" />
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <EntityRowActions
                        onDelete={() => setDeleteIngredient(ingredient)}
                        onEdit={() => setEditIngredient(ingredient)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {ingredients.map((ingredient) => {
          const linkedProduct = inventoryProducts.find(
            (product) => product.id === ingredient.inventory_product_id,
          );

          return (
            <article className="kinder-mobile-card" key={ingredient.id}>
              <p className="font-medium">{ingredient.name}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {ingredient.unit}
                {ingredient.allergen_tags.length > 0 ?
                  ` · ${ingredient.allergen_tags.join(', ')}`
                : ''}
              </p>
              {linkedProduct ? (
                <div className="mt-2 space-y-1">
                  <p className="text-muted-foreground text-xs">
                    <Trans
                      i18nKey="kinder:mealMenu.inventoryStock"
                      values={{
                        name: linkedProduct.name,
                        quantity: linkedProduct.quantity,
                        unit: linkedProduct.unit,
                      }}
                    />
                  </p>
                  {linkedProduct.isLowStock ? (
                    <Badge variant="destructive">
                      <Trans i18nKey="kinder:inventory.lowStock" />
                    </Badge>
                  ) : null}
                </div>
              ) : (
                <p className="text-amber-700 dark:text-amber-400 mt-2 text-xs">
                  <Trans i18nKey="kinder:mealMenu.noInventoryLinkHint" />
                </p>
              )}
              <div className="mt-3">
                <EntityRowActions
                  onDelete={() => setDeleteIngredient(ingredient)}
                  onEdit={() => setEditIngredient(ingredient)}
                />
              </div>
            </article>
          );
        })}
      </div>

      {editIngredient ? (
        <EditIngredientDialog
          ingredient={editIngredient}
          inventoryProducts={inventoryProducts}
          onOpenChange={(open) => {
            if (!open) {
              setEditIngredient(null);
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
          if (deleteIngredient) {
            deleteMutation.mutate({
              schoolId,
              ingredientId: deleteIngredient.id,
            });
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteIngredient(null);
          }
        }}
        open={Boolean(deleteIngredient)}
        pending={deleteMutation.isPending}
        title={<Trans i18nKey="kinder:ui.confirmDelete" />}
      />
    </>
  );
}

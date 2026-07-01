import { AlertTriangle } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import type { MenuNutritionSummary } from '~/lib/kinder/meal-menu/load-menu-templates';

export function MenuNutritionReport({
  summary,
}: {
  summary: MenuNutritionSummary;
}) {
  return (
    <div className="space-y-4 rounded-lg border p-4">
      <p className="font-medium">
        <Trans i18nKey="kinder:mealMenu.nutritionReport" />
      </p>

      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
          <Trans i18nKey="kinder:mealMenu.allergens" />
        </p>
        {summary.allergens.length === 0 ? (
          <p className="text-muted-foreground text-sm">—</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {summary.allergens.map((allergen) => (
              <span
                className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs"
                key={allergen}
              >
                {allergen}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">
          <Trans i18nKey="kinder:mealMenu.ingredientRequirements" />
        </p>
        {summary.ingredientRequirements.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:mealMenu.noIngredientRequirements" />
          </p>
        ) : (
          <ul className="divide-y rounded-md border text-sm">
            {summary.ingredientRequirements.map((item) => {
              const insufficient =
                item.inventoryProductId !== null &&
                item.stockQuantity !== null &&
                item.stockQuantity < item.totalQuantity;

              return (
                <li
                  className="flex items-center justify-between gap-2 px-3 py-2"
                  key={item.ingredientId}
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {item.totalQuantity} {item.unit}
                      {item.inventoryProductId
                        ? ` · Kho: ${item.stockQuantity ?? 0} ${item.unit}`
                        : ''}
                    </p>
                  </div>
                  {insufficient ? (
                    <span className="text-destructive flex items-center gap-1 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      <Trans i18nKey="kinder:mealMenu.insufficientStock" />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

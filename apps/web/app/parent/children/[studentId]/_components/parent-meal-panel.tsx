'use client';

import { UtensilsCrossed } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { ParentEmptyState, ParentSectionHeader } from '~/components/parent-portal';
import type { PublishedMenuDay } from '~/lib/kinder/meal-menu/types';

type MenuWeekDay = {
  menuDate: string;
  menu: (PublishedMenuDay & { menuTitle: string }) | null;
};

const MEAL_SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'] as const;

export function ParentMealPanel({
  todayMenu,
  weekMenus,
  allergies,
}: {
  todayMenu: (PublishedMenuDay & { menuTitle: string }) | null;
  weekMenus: MenuWeekDay[];
  allergies: Array<{ allergen: string; severity: string | null }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <ParentSectionHeader
        description={<Trans i18nKey="kinder:parent.meals.todayHint" />}
        title={<Trans i18nKey="kinder:parent.meals.today" />}
      />

      {todayMenu ? (
        <MealDayCard menu={todayMenu} />
      ) : (
        <ParentEmptyState
          descriptionKey="kinder:parent.meals.emptyToday"
          icon={UtensilsCrossed}
          titleKey="kinder:parent.meals.today"
        />
      )}

      {allergies.length > 0 ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm font-semibold text-foreground">
            <Trans i18nKey="kinder:parent.meals.allergyNote" />
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {allergies.map((allergy) => (
              <li className="text-sm text-muted-foreground" key={allergy.allergen}>
                {allergy.allergen}
                {allergy.severity ? ` (${allergy.severity})` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ParentSectionHeader
        description={<Trans i18nKey="kinder:parent.meals.weekHint" />}
        title={<Trans i18nKey="kinder:parent.meals.week" />}
      />

      <div className="flex flex-col gap-3">
        {weekMenus.map(({ menuDate, menu }) => (
          <div className="rounded-xl border border-border bg-card p-4" key={menuDate}>
            <p className="mb-3 text-sm font-semibold text-foreground">{menuDate}</p>
            {menu ? (
              <ul className="flex flex-col gap-2">
                {menu.meals.map((meal, index) => (
                  <li className="text-sm" key={`${meal.slot}-${index}`}>
                    <span className="font-medium text-primary">
                      <Trans i18nKey={`kinder:menu.mealSlots.${meal.slot}`} />
                    </span>
                    : {meal.dishName}
                    {meal.portionNotes ? (
                      <span className="text-muted-foreground">
                        {' '}
                        ({meal.portionNotes})
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function MealDayCard({
  menu,
}: {
  menu: PublishedMenuDay & { menuTitle: string };
}) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
      <p className="text-sm font-semibold text-primary">{menu.menuTitle}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {menu.meals.map((meal, index) => (
          <li
            className="rounded-lg bg-card px-3 py-2 text-sm text-foreground"
            key={`${meal.slot}-${index}`}
          >
            <span className="font-medium">
              <Trans i18nKey={`kinder:menu.mealSlots.${meal.slot}`} />
            </span>
            : {meal.dishName}
          </li>
        ))}
      </ul>
    </div>
  );
}

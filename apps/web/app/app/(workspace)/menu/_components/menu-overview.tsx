import { BookCopy, ChefHat, ClipboardList, UtensilsCrossed } from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';
import type { Dish, Ingredient, Menu } from '~/lib/kinder/meal-menu/types';

export function MenuOverview({
  menus,
  dishes,
  ingredients,
}: {
  menus: Menu[];
  dishes: Dish[];
  ingredients: Ingredient[];
}) {
  const published = menus.filter((menu) => menu.status === 'published').length;
  const draft = menus.length - published;

  return (
    <BentoGrid className="mb-2" columns={4}>
      <StatCard
        icon={ClipboardList}
        labelKey="kinder:mealMenu.stats.totalMenus"
        tone="default"
        value={String(menus.length)}
        trend={draft > 0 ? String(draft) : undefined}
        trendDirection="neutral"
        trendLabelKey="kinder:mealMenu.stats.draftCount"
      />
      <StatCard
        icon={BookCopy}
        labelKey="kinder:mealMenu.stats.published"
        tone="success"
        value={String(published)}
      />
      <StatCard
        icon={UtensilsCrossed}
        labelKey="kinder:mealMenu.stats.dishes"
        tone="info"
        value={String(dishes.length)}
      />
      <StatCard
        icon={ChefHat}
        labelKey="kinder:mealMenu.stats.ingredients"
        tone="warning"
        value={String(ingredients.length)}
      />
    </BentoGrid>
  );
}

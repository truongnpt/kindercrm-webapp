'use client';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import type { MenuNutritionSummary } from '~/lib/kinder/meal-menu/load-menu-templates';
import type { Dish, MenuWithItems } from '~/lib/kinder/meal-menu/types';

import { MenuNutritionReport } from './menu-nutrition-report';
import { MenuWeekPlanner } from './menu-week-planner';

export function MenuDetailWorkspace({
  menu,
  dishes,
  nutritionSummary,
  schoolId,
}: {
  menu: MenuWithItems;
  dishes: Dish[];
  nutritionSummary: MenuNutritionSummary;
  schoolId: string;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:mealMenu.detailHint" />}
          title={<Trans i18nKey="kinder:mealMenu.weekPlanner" />}
        />
      </div>

      <TabbedModule className="min-w-0 p-4 gap-0" defaultValue="planner">
        <TabbedModuleList >
          <TabbedModuleTrigger value="planner">
            <Trans i18nKey="kinder:mealMenu.weekPlanner" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="nutrition">
            <Trans i18nKey="kinder:mealMenu.nutritionReport" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent
          className="px-5 py-5 sm:px-6 sm:py-6"
          value="planner"
        >
          <MenuWeekPlanner dishes={dishes} menu={menu} schoolId={schoolId} />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="px-5 pb-5 sm:px-6 sm:pb-6"
          value="nutrition"
        >
          <MenuNutritionReport summary={nutritionSummary} />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}

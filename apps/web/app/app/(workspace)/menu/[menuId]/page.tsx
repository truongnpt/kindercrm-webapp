import { notFound } from 'next/navigation';

import {
  DetailPageHeader,
  KinderPageBody,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  loadDishes,
  loadMenuWithItems,
} from '~/lib/kinder/meal-menu/load-meal-menu';
import { loadMenuNutritionSummary } from '~/lib/kinder/meal-menu/load-menu-templates';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { MenuWeekPlanner } from './_components/menu-week-planner';
import { MenuNutritionReport } from './_components/menu-nutrition-report';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:mealMenu.weekPlanner'),
  };
};

async function MenuDetailPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const { menuId } = await params;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'meal_menu');

  let menu;

  try {
    menu = await loadMenuWithItems(context.school.id, menuId);
  } catch {
    notFound();
  }

  const dishes = await loadDishes(context.school.id);
  const nutritionSummary = await loadMenuNutritionSummary(
    context.school.id,
    menu,
  );

  return (
    <>
      <DetailPageHeader
        backHref={pathsConfig.app.menu}
        description={`${menu.start_date} → ${menu.end_date}`}
        title={menu.title}
      />

      <KinderPageBody>
        <div className="flex flex-col gap-6">
          <MenuNutritionReport summary={nutritionSummary} />
          <MenuWeekPlanner
            dishes={dishes}
            menu={menu}
            schoolId={context.school.id}
          />
        </div>
      </KinderPageBody>
    </>
  );
}

export default withI18n(MenuDetailPage);

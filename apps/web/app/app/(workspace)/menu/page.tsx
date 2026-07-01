import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';

import {
  loadDishes,
  loadIngredients,
  loadMenus,
} from '~/lib/kinder/meal-menu/load-meal-menu';
import { loadMenuTemplates } from '~/lib/kinder/meal-menu/load-menu-templates';
import { loadProductsWithStock } from '~/lib/kinder/inventory/load-inventory';
import { hasSchoolFeature, requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateMenuDialog } from './_components/create-menu-dialog';
import { MenuOverview } from './_components/menu-overview';
import { MenuWorkspace } from './_components/menu-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:mealMenu.title'),
  };
};

async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'meal_menu');

  const [menus, dishes, ingredients, templates, inventoryProducts] =
    await Promise.all([
      loadMenus(context.school.id),
      loadDishes(context.school.id),
      loadIngredients(context.school.id),
      loadMenuTemplates(context.school.id),
      hasSchoolFeature(context, 'inventory') ?
        loadProductsWithStock(context.school.id)
      : Promise.resolve([]),
    ]);

  return (
    <>
      <KinderPageHeader
        actions={<CreateMenuDialog schoolId={context.school.id} />}
        breadcrumbs={[{ label: <Trans i18nKey="kinder:mealMenu.title" /> }]}
        description={<Trans i18nKey="kinder:mealMenu.description" />}
        title={<Trans i18nKey="kinder:mealMenu.title" />}
      />

      <KinderPageBody>
        <MenuOverview
          dishes={dishes}
          ingredients={ingredients}
          menus={menus}
        />

        <MenuWorkspace
          defaultTab={tab ?? 'menus'}
          dishes={dishes}
          ingredients={ingredients}
          inventoryProducts={inventoryProducts}
          menus={menus}
          schoolId={context.school.id}
          templates={templates}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(MenuPage);

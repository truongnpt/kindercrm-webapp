import { Trans } from '@kit/ui/trans';

import {
  KinderPageBody,
  KinderPageHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';

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

import { DishesPanel } from './_components/dishes-panel';
import { IngredientsPanel } from './_components/ingredients-panel';
import { MenuTemplatesPanel } from './_components/menu-templates-panel';
import { MenusPanel } from './_components/menus-panel';

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
    hasSchoolFeature(context, 'inventory')
      ? loadProductsWithStock(context.school.id)
      : Promise.resolve([]),
  ]);

  return (
    <>
      <KinderPageHeader
        description={<Trans i18nKey="kinder:mealMenu.description" />}
        title={<Trans i18nKey="kinder:mealMenu.title" />}
      />

      <KinderPageBody>
        <TabbedModule defaultValue={tab ?? 'menus'}>
          <TabbedModuleList>
            <TabbedModuleTrigger value="menus">
              <Trans i18nKey="kinder:mealMenu.tabs.menus" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="dishes">
              <Trans i18nKey="kinder:mealMenu.tabs.dishes" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="ingredients">
              <Trans i18nKey="kinder:mealMenu.tabs.ingredients" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="templates">
              <Trans i18nKey="kinder:mealMenu.tabs.templates" />
            </TabbedModuleTrigger>
          </TabbedModuleList>

          <TabbedModuleContent value="menus">
            <MenusPanel menus={menus} schoolId={context.school.id} />
          </TabbedModuleContent>

          <TabbedModuleContent value="dishes">
            <DishesPanel dishes={dishes} schoolId={context.school.id} />
          </TabbedModuleContent>

          <TabbedModuleContent value="ingredients">
            <IngredientsPanel
              ingredients={ingredients}
              inventoryProducts={inventoryProducts}
              schoolId={context.school.id}
            />
          </TabbedModuleContent>

          <TabbedModuleContent value="templates">
            <MenuTemplatesPanel
              menus={menus}
              schoolId={context.school.id}
              templates={templates}
            />
          </TabbedModuleContent>
        </TabbedModule>
      </KinderPageBody>
    </>
  );
}

export default withI18n(MenuPage);

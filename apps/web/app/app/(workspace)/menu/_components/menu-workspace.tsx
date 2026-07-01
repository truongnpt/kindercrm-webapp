'use client';

import {
  BookCopy,
  ChefHat,
  ClipboardList,
  UtensilsCrossed,
} from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';
import type { Dish, Ingredient, Menu } from '~/lib/kinder/meal-menu/types';
import type { MenuTemplate } from '~/lib/kinder/meal-menu/types-templates';

import { CreateDishDialog } from './create-dish-dialog';
import { CreateIngredientDialog } from './create-ingredient-dialog';
import { DishesList } from './dishes-list';
import { IngredientsList } from './ingredients-list';
import { MenusList } from './menus-list';
import { SaveTemplateDialog } from './save-template-dialog';
import { TemplatesList } from './templates-list';

export function MenuWorkspace({
  schoolId,
  menus,
  dishes,
  ingredients,
  templates,
  inventoryProducts,
  defaultTab,
}: {
  schoolId: string;
  menus: Menu[];
  dishes: Dish[];
  ingredients: Ingredient[];
  templates: MenuTemplate[];
  inventoryProducts: InventoryProductWithStock[];
  defaultTab: string;
}) {
  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:mealMenu.workspaceHint" />}
          title={<Trans i18nKey="kinder:mealMenu.workspaceTitle" />}
        />
      </div>

      <TabbedModule className="min-w-0 gap-0 p-4" defaultValue={defaultTab}>
        <TabbedModuleList className="flex-wrap">
          <TabbedModuleTrigger value="menus">
            <ClipboardList className="size-4" />
            <Trans i18nKey="kinder:mealMenu.tabs.menus" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="dishes">
            <UtensilsCrossed className="size-4" />
            <Trans i18nKey="kinder:mealMenu.tabs.dishes" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="ingredients">
            <ChefHat className="size-4" />
            <Trans i18nKey="kinder:mealMenu.tabs.ingredients" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="templates">
            <BookCopy className="size-4" />
            <Trans i18nKey="kinder:mealMenu.tabs.templates" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent
          className="min-w-0 px-1 pt-4 sm:px-2"
          value="menus"
        >
          <MenusList menus={menus} schoolId={schoolId} />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="min-w-0 px-1 pt-4 sm:px-2"
          value="dishes"
        >
          <div className="mb-4 flex justify-end">
            <CreateDishDialog schoolId={schoolId} />
          </div>
          <DishesList dishes={dishes} schoolId={schoolId} />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="min-w-0 px-1 pt-4 sm:px-2"
          value="ingredients"
        >
          <div className="mb-4 flex justify-end">
            <CreateIngredientDialog
              inventoryProducts={inventoryProducts}
              schoolId={schoolId}
            />
          </div>
          <IngredientsList
            ingredients={ingredients}
            inventoryProducts={inventoryProducts}
            schoolId={schoolId}
          />
        </TabbedModuleContent>

        <TabbedModuleContent
          className="min-w-0 px-1 pt-4 sm:px-2"
          value="templates"
        >
          <div className="mb-4 flex justify-end">
            <SaveTemplateDialog menus={menus} schoolId={schoolId} />
          </div>
          <TemplatesList menus={menus} schoolId={schoolId} templates={templates} />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}

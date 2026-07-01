import type { Database } from '~/lib/database.types';

export type MenuTemplate =
  Database['public']['Tables']['menu_templates']['Row'];

export type MenuTemplateItem = {
  menuDate: string;
  mealSlot: Database['public']['Enums']['meal_slot'];
  dishId?: string;
  customDishName?: string;
  portionNotes?: string;
  sortOrder?: number;
};

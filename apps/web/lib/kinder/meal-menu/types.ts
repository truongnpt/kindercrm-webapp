import type { Database } from '~/lib/database.types';

export type MealCategory =
  Database['public']['Tables']['meal_categories']['Row'];

export type Ingredient = Database['public']['Tables']['ingredients']['Row'];

export type Dish = Database['public']['Tables']['dishes']['Row'];

export type Menu = Database['public']['Tables']['menus']['Row'];

export type MenuItem = Database['public']['Tables']['menu_items']['Row'];

export type MenuWithItems = Menu & {
  items: Array<MenuItem & { dish: Dish | null }>;
};

export type PublishedMenuDay = {
  menuDate: string;
  meals: Array<{
    slot: Database['public']['Enums']['meal_slot'];
    dishName: string;
    portionNotes: string | null;
  }>;
};

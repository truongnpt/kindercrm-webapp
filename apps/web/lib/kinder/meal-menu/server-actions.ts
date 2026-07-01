'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { SupabaseClient } from '@supabase/supabase-js';

import pathsConfig from '~/config/paths.config';
import type { Database } from '~/lib/database.types';

import {
  ApplyMenuTemplateSchema,
  CreateMenuSchema,
  DeleteMenuItemSchema,
  DeleteMenuTemplateSchema,
  PublishMenuSchema,
  SaveMenuTemplateSchema,
  UpsertDishSchema,
  UpsertIngredientSchema,
  UpsertMenuItemSchema,
} from './schemas/meal-menu.schema';

const MENU_PATH = pathsConfig.app.menu;

function revalidateMenuPaths() {
  revalidatePath(MENU_PATH);
  revalidatePath(pathsConfig.parent.home);
}

export const upsertIngredientAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const payload = {
      school_id: data.schoolId,
      name: data.name,
      unit: data.unit,
      allergen_tags: data.allergenTags,
      notes: data.notes || null,
      inventory_product_id: data.inventoryProductId || null,
    };

    const { error } = data.id
      ? await client.from('ingredients').update(payload).eq('id', data.id)
      : await client.from('ingredients').insert(payload);

    if (error) {
      throw error;
    }

    revalidateMenuPaths();
    return { success: true };
  },
  { schema: UpsertIngredientSchema },
);

export const upsertDishAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const payload = {
      school_id: data.schoolId,
      meal_category_id: data.mealCategoryId || null,
      name: data.name,
      description: data.description || null,
      allergen_tags: data.allergenTags,
    };

    const { error } = data.id
      ? await client.from('dishes').update(payload).eq('id', data.id)
      : await client.from('dishes').insert(payload);

    if (error) {
      throw error;
    }

    revalidateMenuPaths();
    return { success: true };
  },
  { schema: UpsertDishSchema },
);

export const createMenuAction = enhanceAction(
  async (data, _user) => {
    const client = getSupabaseServerClient();

    const { data: menu, error } = await client
      .from('menus')
      .insert({
        school_id: data.schoolId,
        title: data.title,
        period_type: data.periodType,
        start_date: data.startDate,
        end_date: data.endDate,
        notes: data.notes || null,
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    await seedDefaultMealCategories(client, data.schoolId);

    revalidateMenuPaths();
    return { success: true, menuId: menu?.id };
  },
  { schema: CreateMenuSchema },
);

export const upsertMenuItemAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('menu_items').upsert(
      {
        school_id: data.schoolId,
        menu_id: data.menuId,
        menu_date: data.menuDate,
        meal_slot: data.mealSlot,
        dish_id: data.dishId || null,
        custom_dish_name: data.customDishName || null,
        portion_notes: data.portionNotes || null,
        sort_order: data.sortOrder,
      },
      { onConflict: 'menu_id,menu_date,meal_slot,sort_order' },
    );

    if (error) {
      throw error;
    }

    revalidateMenuPaths();
    return { success: true };
  },
  { schema: UpsertMenuItemSchema },
);

export const deleteMenuItemAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('menu_items')
      .delete()
      .eq('id', data.menuItemId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateMenuPaths();
    return { success: true };
  },
  { schema: DeleteMenuItemSchema },
);

/** MENU-011 Publish menu */
export const publishMenuAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('menus')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_by: user.id,
      })
      .eq('id', data.menuId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateMenuPaths();
    return { success: true };
  },
  { schema: PublishMenuSchema },
);

async function seedDefaultMealCategories(
  client: SupabaseClient<Database>,
  schoolId: string,
) {
  const defaults = [
    { code: 'breakfast', name: 'Bữa sáng', sort_order: 0 },
    { code: 'lunch', name: 'Bữa trưa', sort_order: 1 },
    { code: 'snack', name: 'Bữa phụ', sort_order: 2 },
  ];

  for (const category of defaults) {
    await client.from('meal_categories').upsert(
      {
        school_id: schoolId,
        code: category.code,
        name: category.name,
        sort_order: category.sort_order,
      },
      { onConflict: 'school_id,code' },
    );
  }
}

export const ensureMealCategoriesAction = enhanceAction(
  async (data: { schoolId: string }) => {
    const client = getSupabaseServerClient();
    await seedDefaultMealCategories(client, data.schoolId);
    revalidateMenuPaths();
    return { success: true };
  },
  {
    schema: CreateMenuSchema.pick({ schoolId: true }),
  },
);

/** MENU-014 Save menu as template */
export const saveMenuTemplateAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: menu, error: menuError } = await client
      .from('menus')
      .select('period_type')
      .eq('id', data.menuId)
      .eq('school_id', data.schoolId)
      .single();

    if (menuError) {
      throw menuError;
    }

    const { data: items, error: itemsError } = await client
      .from('menu_items')
      .select('*')
      .eq('menu_id', data.menuId);

    if (itemsError) {
      throw itemsError;
    }

    const templateItems = (items ?? []).map((item) => ({
      menuDate: item.menu_date,
      mealSlot: item.meal_slot,
      dishId: item.dish_id ?? undefined,
      customDishName: item.custom_dish_name ?? undefined,
      portionNotes: item.portion_notes ?? undefined,
      sortOrder: item.sort_order,
    }));

    const { error } = await client.from('menu_templates').insert({
      school_id: data.schoolId,
      name: data.name,
      description: data.description || null,
      period_type: menu.period_type,
      items: templateItems,
      created_by: user.id,
    });

    if (error) {
      throw error;
    }

    revalidateMenuPaths();
    return { success: true };
  },
  { schema: SaveMenuTemplateSchema },
);

/** MENU-014 Apply template to menu */
export const applyMenuTemplateAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: template, error: templateError } = await client
      .from('menu_templates')
      .select('items')
      .eq('id', data.templateId)
      .eq('school_id', data.schoolId)
      .single();

    if (templateError) {
      throw templateError;
    }

    const items = (template.items as Array<{
      menuDate: string;
      mealSlot: string;
      dishId?: string;
      customDishName?: string;
      portionNotes?: string;
      sortOrder?: number;
    }>) ?? [];

    await client
      .from('menu_items')
      .delete()
      .eq('menu_id', data.menuId)
      .eq('school_id', data.schoolId);

    if (items.length > 0) {
      const { error } = await client.from('menu_items').insert(
        items.map((item) => ({
          school_id: data.schoolId,
          menu_id: data.menuId,
          menu_date: item.menuDate,
          meal_slot: item.mealSlot as Database['public']['Enums']['meal_slot'],
          dish_id: item.dishId || null,
          custom_dish_name: item.customDishName || null,
          portion_notes: item.portionNotes || null,
          sort_order: item.sortOrder ?? 0,
        })),
      );

      if (error) {
        throw error;
      }
    }

    revalidateMenuPaths();
    return { success: true };
  },
  { schema: ApplyMenuTemplateSchema },
);

export const deleteMenuTemplateAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('menu_templates')
      .delete()
      .eq('id', data.templateId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateMenuPaths();
    return { success: true };
  },
  { schema: DeleteMenuTemplateSchema },
);

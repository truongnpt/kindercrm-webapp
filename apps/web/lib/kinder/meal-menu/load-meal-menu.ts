import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type {
  Dish,
  Ingredient,
  MealCategory,
  Menu,
  MenuItem,
  MenuWithItems,
  PublishedMenuDay,
} from './types';

export const loadMealCategories = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('meal_categories')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    throw error;
  }

  return (data ?? []) as MealCategory[];
});

export const loadIngredients = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('ingredients')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as Ingredient[];
});

export const loadDishes = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('dishes')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as Dish[];
});

export const loadMenus = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('menus')
    .select('*')
    .eq('school_id', schoolId)
    .order('start_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Menu[];
});

export const loadMenuWithItems = cache(async (schoolId: string, menuId: string) => {
  const client = getSupabaseServerClient();

  const { data: menu, error: menuError } = await client
    .from('menus')
    .select('*')
    .eq('school_id', schoolId)
    .eq('id', menuId)
    .single();

  if (menuError) {
    throw menuError;
  }

  const { data: items, error: itemsError } = await client
    .from('menu_items')
    .select(
      `
      *,
      dish:dishes (*)
    `,
    )
    .eq('menu_id', menuId)
    .order('menu_date')
    .order('sort_order');

  if (itemsError) {
    throw itemsError;
  }

  return {
    ...(menu as Menu),
    items: (items ?? []).map((item) => ({
      ...(item as MenuItem),
      dish: (item.dish as Dish | null) ?? null,
    })),
  } satisfies MenuWithItems;
});

export const loadPublishedMenuForDate = cache(
  async (schoolId: string, menuDate: string) => {
    const client = getSupabaseServerClient();

    const { data: menu, error: menuError } = await client
      .from('menus')
      .select('id, title')
      .eq('school_id', schoolId)
      .eq('status', 'published')
      .lte('start_date', menuDate)
      .gte('end_date', menuDate)
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (menuError) {
      throw menuError;
    }

    if (!menu) {
      return null;
    }

    const { data: items, error: itemsError } = await client
      .from('menu_items')
      .select(
        `
        meal_slot,
        portion_notes,
        custom_dish_name,
        dish:dishes (name)
      `,
      )
      .eq('menu_id', menu.id)
      .eq('menu_date', menuDate)
      .order('sort_order');

    if (itemsError) {
      throw itemsError;
    }

    return {
      menuTitle: menu.title,
      menuDate,
      meals: (items ?? []).map((item) => ({
        slot: item.meal_slot as PublishedMenuDay['meals'][number]['slot'],
        dishName:
          item.custom_dish_name ||
          (item.dish as { name: string } | null)?.name ||
          '—',
        portionNotes: item.portion_notes,
      })),
    } satisfies PublishedMenuDay & { menuTitle: string };
  },
);

export const loadParentPublishedMenu = cache(
  async (schoolId: string, menuDate: string) => {
    return loadPublishedMenuForDate(schoolId, menuDate);
  },
);

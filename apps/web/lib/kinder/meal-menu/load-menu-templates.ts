import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { MenuTemplate } from './types-templates';
import type { Dish, Ingredient, MenuWithItems } from './types';

export const loadMenuTemplates = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('menu_templates')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as MenuTemplate[];
});

export type MenuNutritionSummary = {
  allergens: string[];
  ingredientRequirements: Array<{
    ingredientId: string;
    name: string;
    unit: string;
    totalQuantity: number;
    inventoryProductId: string | null;
    stockQuantity: number | null;
  }>;
};

export const loadMenuNutritionSummary = cache(
  async (schoolId: string, menu: MenuWithItems) => {
    const client = getSupabaseServerClient();

    const dishIds = [
      ...new Set(
        menu.items
          .map((item) => item.dish_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const [dishesResult, ingredientsResult, productsResult] = await Promise.all([
      dishIds.length > 0
        ? client.from('dishes').select('*').in('id', dishIds)
        : Promise.resolve({ data: [], error: null }),
      client
        .from('ingredients')
        .select('*')
        .eq('school_id', schoolId)
        .eq('is_active', true),
      client
        .from('inventory_products')
        .select('id, name, unit')
        .eq('school_id', schoolId)
        .eq('is_active', true),
    ]);

    if (dishesResult.error) {
      throw dishesResult.error;
    }

    if (ingredientsResult.error) {
      throw ingredientsResult.error;
    }

    if (productsResult.error) {
      throw productsResult.error;
    }

    const dishes = (dishesResult.data ?? []) as Dish[];
    const ingredients = (ingredientsResult.data ?? []) as Ingredient[];
    const _products = productsResult.data ?? [];

    const productIds = ingredients
      .map((ingredient) => ingredient.inventory_product_id)
      .filter((id): id is string => Boolean(id));

    const { data: stockRows, error: stockError } =
      productIds.length > 0
        ? await client
            .from('inventory_stock')
            .select('product_id, quantity')
            .eq('school_id', schoolId)
            .in('product_id', productIds)
        : { data: [], error: null };

    if (stockError) {
      throw stockError;
    }

    const stockByProduct = new Map(
      (stockRows ?? []).map((row) => [row.product_id, Number(row.quantity)]),
    );

    const allergenSet = new Set<string>();
    const requirementMap = new Map<
      string,
      { name: string; unit: string; totalQuantity: number; inventoryProductId: string | null }
    >();

    for (const dish of dishes) {
      for (const tag of dish.allergen_tags) {
        allergenSet.add(tag);
      }

      const items = Array.isArray(dish.ingredient_items)
        ? (dish.ingredient_items as Array<{
            ingredientId?: string;
            quantity?: number;
          }>)
        : [];

      for (const item of items) {
        if (!item.ingredientId) {
          continue;
        }

        const ingredient = ingredients.find((row) => row.id === item.ingredientId);

        if (!ingredient) {
          continue;
        }

        const existing = requirementMap.get(ingredient.id);
        const quantity = Number(item.quantity ?? 0);

        requirementMap.set(ingredient.id, {
          name: ingredient.name,
          unit: ingredient.unit,
          inventoryProductId: ingredient.inventory_product_id,
          totalQuantity: (existing?.totalQuantity ?? 0) + quantity,
        });
      }
    }

    return {
      allergens: [...allergenSet].sort(),
      ingredientRequirements: [...requirementMap.entries()].map(
        ([ingredientId, value]) => ({
          ingredientId,
          name: value.name,
          unit: value.unit,
          totalQuantity: value.totalQuantity,
          inventoryProductId: value.inventoryProductId,
          stockQuantity: value.inventoryProductId
            ? (stockByProduct.get(value.inventoryProductId) ?? 0)
            : null,
        }),
      ),
    } satisfies MenuNutritionSummary;
  },
);

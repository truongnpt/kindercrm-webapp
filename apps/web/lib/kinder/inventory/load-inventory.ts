import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type {
  InventoryCategory,
  InventoryProductWithStock,
  InventorySummary,
  InventorySupplier,
  InventoryTransaction,
} from './types';

export const loadInventoryCategories = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('inventory_categories')
    .select('*')
    .eq('school_id', schoolId)
    .order('sort_order')
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as InventoryCategory[];
});

export const loadSuppliers = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('inventory_suppliers')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as InventorySupplier[];
});

export const loadProductsWithStock = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data: products, error: productsError } = await client
    .from('inventory_products')
    .select('*')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('name');

  if (productsError) {
    throw productsError;
  }

  const { data: stock, error: stockError } = await client
    .from('inventory_stock')
    .select('product_id, quantity')
    .eq('school_id', schoolId);

  if (stockError) {
    throw stockError;
  }

  const stockByProduct = new Map(
    (stock ?? []).map((row) => [row.product_id, Number(row.quantity)]),
  );

  return (products ?? []).map((product) => {
    const quantity = stockByProduct.get(product.id) ?? 0;

    return {
      ...product,
      quantity,
      isLowStock: quantity <= Number(product.min_quantity),
    };
  }) as InventoryProductWithStock[];
});

export const loadLowStockProducts = cache(async (schoolId: string) => {
  const products = await loadProductsWithStock(schoolId);

  return products.filter((product) => product.isLowStock);
});

export const loadInventoryTransactions = cache(
  async (schoolId: string, limit = 50) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('inventory_transactions')
      .select(
        `
        *,
        product:inventory_products (name, unit, sku)
      `,
      )
      .eq('school_id', schoolId)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return (data ?? []) as Array<
      InventoryTransaction & {
        product: { name: string; unit: string; sku: string | null } | null;
      }
    >;
  },
);

export const loadInventorySummary = cache(
  async (schoolId: string): Promise<InventorySummary> => {
    const products = await loadProductsWithStock(schoolId);

    return {
      totalProducts: products.length,
      lowStockCount: products.filter((product) => product.isLowStock).length,
      totalStockValue: products.reduce(
        (sum, product) => sum + product.quantity,
        0,
      ),
    };
  },
);

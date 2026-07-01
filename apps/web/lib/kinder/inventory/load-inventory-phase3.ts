import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type {
  ExpiringBatch,
  StockCountWithItems,
} from './types-phase3';

export const loadStockCounts = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('stock_counts')
    .select('*')
    .eq('school_id', schoolId)
    .order('count_date', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
});

export const loadStockCountWithItems = cache(
  async (schoolId: string, stockCountId: string) => {
    const client = getSupabaseServerClient();

    const { data: stockCount, error: countError } = await client
      .from('stock_counts')
      .select('*')
      .eq('school_id', schoolId)
      .eq('id', stockCountId)
      .single();

    if (countError) {
      throw countError;
    }

    const { data: items, error: itemsError } = await client
      .from('stock_count_items')
      .select('*')
      .eq('stock_count_id', stockCountId);

    if (itemsError) {
      throw itemsError;
    }

    const productIds = [...new Set((items ?? []).map((item) => item.product_id))];
    const { data: products, error: productsError } =
      productIds.length > 0
        ? await client
            .from('inventory_products')
            .select('id, name, unit')
            .in('id', productIds)
        : { data: [], error: null };

    if (productsError) {
      throw productsError;
    }

    const productById = new Map(
      (products ?? []).map((product) => [product.id, product]),
    );

    return {
      ...stockCount,
      items: (items ?? []).map((item) => ({
        ...item,
        product: productById.get(item.product_id) ?? null,
      })),
    } satisfies StockCountWithItems;
  },
);

export const loadExpiringBatches = cache(
  async (schoolId: string, withinDays = 30) => {
    const client = getSupabaseServerClient();
    const today = new Date();
    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + withinDays);

    const { data, error } = await client
      .from('inventory_transactions')
      .select('product_id, expiry_date, quantity')
      .eq('school_id', schoolId)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', limitDate.toISOString().slice(0, 10))
      .gte('expiry_date', today.toISOString().slice(0, 10))
      .in('transaction_type', ['receipt', 'adjustment'])
      .order('expiry_date');

    if (error) {
      throw error;
    }

    const productIds = [...new Set((data ?? []).map((row) => row.product_id))];
    const { data: products, error: productsError } =
      productIds.length > 0
        ? await client
            .from('inventory_products')
            .select('id, name, unit, track_expiry')
            .in('id', productIds)
        : { data: [], error: null };

    if (productsError) {
      throw productsError;
    }

    const productById = new Map(
      (products ?? []).map((product) => [product.id, product]),
    );

    const batches: ExpiringBatch[] = [];

    for (const row of data ?? []) {
      const product = productById.get(row.product_id);

      if (!product?.track_expiry || !row.expiry_date) {
        continue;
      }

      const expiry = new Date(row.expiry_date);
      const daysUntilExpiry = Math.ceil(
        (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      batches.push({
        productId: row.product_id,
        productName: product.name,
        unit: product.unit,
        expiryDate: row.expiry_date,
        quantity: Number(row.quantity),
        daysUntilExpiry,
      });
    }

    return batches;
  },
);

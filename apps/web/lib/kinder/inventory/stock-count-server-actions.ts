'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

import {
  CompleteStockCountSchema,
  CreateStockCountSchema,
  TransferStockSchema,
  UpsertStockCountItemSchema,
} from './schemas/inventory-phase3.schema';

const INVENTORY_PATH = pathsConfig.app.inventory;

function revalidateInventoryPaths() {
  revalidatePath(INVENTORY_PATH);
}

/** INV-010 Create stock count session */
export const createStockCountAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: products, error: productsError } = await client
      .from('inventory_products')
      .select('id')
      .eq('school_id', data.schoolId)
      .eq('is_active', true);

    if (productsError) {
      throw productsError;
    }

    const { data: stockRows, error: stockError } = await client
      .from('inventory_stock')
      .select('product_id, quantity')
      .eq('school_id', data.schoolId);

    if (stockError) {
      throw stockError;
    }

    const stockByProduct = new Map(
      (stockRows ?? []).map((row) => [row.product_id, Number(row.quantity)]),
    );

    const { data: stockCount, error } = await client
      .from('stock_counts')
      .insert({
        school_id: data.schoolId,
        title: data.title,
        count_date: data.countDate,
        notes: data.notes || null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    if (products && products.length > 0 && stockCount) {
      const { error: itemsError } = await client.from('stock_count_items').insert(
        products.map((product) => ({
          school_id: data.schoolId,
          stock_count_id: stockCount.id,
          product_id: product.id,
          expected_quantity: stockByProduct.get(product.id) ?? 0,
        })),
      );

      if (itemsError) {
        throw itemsError;
      }
    }

    revalidateInventoryPaths();
    return { success: true, stockCountId: stockCount?.id };
  },
  { schema: CreateStockCountSchema },
);

export const upsertStockCountItemAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('stock_count_items')
      .update({ counted_quantity: data.countedQuantity })
      .eq('stock_count_id', data.stockCountId)
      .eq('product_id', data.productId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateInventoryPaths();
    return { success: true };
  },
  { schema: UpsertStockCountItemSchema },
);

/** INV-010 Complete stock count — post adjustments */
export const completeStockCountAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: items, error: itemsError } = await client
      .from('stock_count_items')
      .select('*')
      .eq('stock_count_id', data.stockCountId)
      .eq('school_id', data.schoolId);

    if (itemsError) {
      throw itemsError;
    }

    const today = new Date().toISOString().slice(0, 10);

    for (const item of items ?? []) {
      if (item.counted_quantity === null) {
        continue;
      }

      const diff =
        Number(item.counted_quantity) - Number(item.expected_quantity);

      if (diff === 0) {
        continue;
      }

      const { error } = await client.from('inventory_transactions').insert({
        school_id: data.schoolId,
        product_id: item.product_id,
        transaction_type: diff > 0 ? 'adjustment' : 'issue',
        quantity: Math.abs(diff),
        transaction_date: today,
        notes: `Kiểm kê #${data.stockCountId.slice(0, 8)}`,
        created_by: user.id,
      });

      if (error) {
        throw error;
      }
    }

    const { error: updateError } = await client
      .from('stock_counts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', data.stockCountId)
      .eq('school_id', data.schoolId);

    if (updateError) {
      throw updateError;
    }

    revalidateInventoryPaths();
    return { success: true };
  },
  { schema: CompleteStockCountSchema },
);

/** INV-008 Transfer stock between products */
export const transferStockAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    if (data.fromProductId === data.toProductId) {
      throw new Error('Cannot transfer to the same product');
    }

    const { error: issueError } = await client
      .from('inventory_transactions')
      .insert({
        school_id: data.schoolId,
        product_id: data.fromProductId,
        transaction_type: 'issue',
        quantity: data.quantity,
        transaction_date: data.transactionDate,
        transfer_to_product_id: data.toProductId,
        notes: data.notes || 'Chuyển kho',
        created_by: user.id,
      });

    if (issueError) {
      throw issueError;
    }

    const { error: receiptError } = await client
      .from('inventory_transactions')
      .insert({
        school_id: data.schoolId,
        product_id: data.toProductId,
        transaction_type: 'receipt',
        quantity: data.quantity,
        transaction_date: data.transactionDate,
        notes: data.notes || 'Nhận chuyển kho',
        created_by: user.id,
      });

    if (receiptError) {
      throw receiptError;
    }

    revalidateInventoryPaths();
    return { success: true };
  },
  { schema: TransferStockSchema },
);

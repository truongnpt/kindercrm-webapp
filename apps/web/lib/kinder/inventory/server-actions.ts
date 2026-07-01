'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

import {
  RecordInventoryTransactionSchema,
  UpsertInventoryCategorySchema,
  UpsertProductSchema,
  UpsertSupplierSchema,
} from './schemas/inventory.schema';

const INVENTORY_PATH = pathsConfig.app.inventory;

function revalidateInventoryPaths() {
  revalidatePath(INVENTORY_PATH);
}

export const upsertInventoryCategoryAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const payload = {
      school_id: data.schoolId,
      name: data.name,
      sort_order: data.sortOrder,
    };

    const { error } = data.id
      ? await client
          .from('inventory_categories')
          .update(payload)
          .eq('id', data.id)
      : await client.from('inventory_categories').insert(payload);

    if (error) {
      throw error;
    }

    revalidateInventoryPaths();
    return { success: true };
  },
  { schema: UpsertInventoryCategorySchema },
);

export const upsertSupplierAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const payload = {
      school_id: data.schoolId,
      name: data.name,
      contact_name: data.contactName || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
    };

    const { error } = data.id
      ? await client.from('inventory_suppliers').update(payload).eq('id', data.id)
      : await client.from('inventory_suppliers').insert(payload);

    if (error) {
      throw error;
    }

    revalidateInventoryPaths();
    return { success: true };
  },
  { schema: UpsertSupplierSchema },
);

export const upsertProductAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const payload = {
      school_id: data.schoolId,
      category_id: data.categoryId || null,
      supplier_id: data.supplierId || null,
      sku: data.sku || null,
      name: data.name,
      unit: data.unit,
      min_quantity: data.minQuantity,
      track_expiry: data.trackExpiry,
      notes: data.notes || null,
    };

    const { data: product, error } = data.id
      ? await client
          .from('inventory_products')
          .update(payload)
          .eq('id', data.id)
          .select('id')
          .single()
      : await client
          .from('inventory_products')
          .insert(payload)
          .select('id')
          .single();

    if (error) {
      throw error;
    }

    if (product?.id && !data.id) {
      await client.from('inventory_stock').upsert(
        {
          school_id: data.schoolId,
          product_id: product.id,
          quantity: 0,
        },
        { onConflict: 'school_id,product_id' },
      );
    }

    revalidateInventoryPaths();
    return { success: true };
  },
  { schema: UpsertProductSchema },
);

/** INV-006/007/009 Record stock movement */
export const recordInventoryTransactionAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('inventory_transactions').insert({
      school_id: data.schoolId,
      product_id: data.productId,
      transaction_type: data.transactionType,
      quantity: data.quantity,
      unit_cost: data.unitCost ?? null,
      transaction_date: data.transactionDate,
      expiry_date: data.expiryDate || null,
      reference_number: data.referenceNumber || null,
      supplier_id: data.supplierId || null,
      notes: data.notes || null,
      created_by: user.id,
    });

    if (error) {
      throw error;
    }

    revalidateInventoryPaths();
    return { success: true };
  },
  { schema: RecordInventoryTransactionSchema },
);

import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { PurchaseOrderWithItems } from './purchase-order-types';

export const loadPurchaseOrders = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('purchase_orders')
    .select(
      `
      *,
      supplier:inventory_suppliers (id, name)
    `,
    )
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Array<
    PurchaseOrderWithItems & { supplier: { id: string; name: string } | null }
  >;
});

export const loadPurchaseOrderDetail = cache(
  async (schoolId: string, purchaseOrderId: string) => {
    const client = getSupabaseServerClient();

    const { data: order, error: orderError } = await client
      .from('purchase_orders')
      .select(
        `
        *,
        supplier:inventory_suppliers (id, name)
      `,
      )
      .eq('school_id', schoolId)
      .eq('id', purchaseOrderId)
      .single();

    if (orderError) {
      throw orderError;
    }

    const { data: items, error: itemsError } = await client
      .from('purchase_order_items')
      .select(
        `
        *,
        product:inventory_products (id, name, unit, sku)
      `,
      )
      .eq('purchase_order_id', purchaseOrderId)
      .order('created_at');

    if (itemsError) {
      throw itemsError;
    }

    return {
      ...(order as PurchaseOrderWithItems),
      items: items ?? [],
    };
  },
);

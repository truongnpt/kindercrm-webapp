'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

import {
  CancelPurchaseOrderSchema,
  CreatePurchaseOrderSchema,
  ReceivePurchaseOrderSchema,
} from './schemas/purchase-order.schema';

const INVENTORY_PATH = pathsConfig.app.inventory;

function revalidatePurchaseOrderPaths() {
  revalidatePath(INVENTORY_PATH);
}

/** INV-005 Create purchase order */
export const createPurchaseOrderAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0,
    );

    const { data: order, error: orderError } = await client
      .from('purchase_orders')
      .insert({
        school_id: data.schoolId,
        supplier_id: data.supplierId || null,
        po_number: data.poNumber,
        order_date: data.orderDate,
        expected_date: data.expectedDate || null,
        notes: data.notes || null,
        total_amount: totalAmount,
        status: 'submitted',
        created_by: user.id,
      })
      .select('id')
      .single();

    if (orderError) {
      throw orderError;
    }

    const rows = data.items.map((item) => ({
      school_id: data.schoolId,
      purchase_order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_cost: item.unitCost,
    }));

    const { error: itemsError } = await client
      .from('purchase_order_items')
      .insert(rows);

    if (itemsError) {
      throw itemsError;
    }

    revalidatePurchaseOrderPaths();
    return { success: true, purchaseOrderId: order.id };
  },
  { schema: CreatePurchaseOrderSchema },
);

/** INV-006 Receive goods into stock */
export const receivePurchaseOrderAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: order, error: orderError } = await client
      .from('purchase_orders')
      .select('id, status, po_number, supplier_id')
      .eq('id', data.purchaseOrderId)
      .eq('school_id', data.schoolId)
      .single();

    if (orderError || !order) {
      throw new Error('Purchase order not found');
    }

    if (order.status === 'received' || order.status === 'cancelled') {
      throw new Error('Purchase order cannot be received');
    }

    const { data: items, error: itemsError } = await client
      .from('purchase_order_items')
      .select('*')
      .eq('purchase_order_id', data.purchaseOrderId);

    if (itemsError) {
      throw itemsError;
    }

    for (const item of items ?? []) {
      const remaining = Number(item.quantity) - Number(item.received_quantity);

      if (remaining <= 0) {
        continue;
      }

      await client.from('inventory_transactions').insert({
        school_id: data.schoolId,
        product_id: item.product_id,
        transaction_type: 'receipt',
        quantity: remaining,
        unit_cost: item.unit_cost,
        transaction_date: new Date().toISOString().slice(0, 10),
        reference_number: order.po_number,
        supplier_id: order.supplier_id,
        notes: `PO receive ${order.po_number}`,
        created_by: user.id,
      });

      await client
        .from('purchase_order_items')
        .update({ received_quantity: item.quantity })
        .eq('id', item.id);
    }

    const { error: updateError } = await client
      .from('purchase_orders')
      .update({
        status: 'received',
        received_at: new Date().toISOString(),
      })
      .eq('id', data.purchaseOrderId);

    if (updateError) {
      throw updateError;
    }

    revalidatePurchaseOrderPaths();
    return { success: true };
  },
  { schema: ReceivePurchaseOrderSchema },
);

export const cancelPurchaseOrderAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('purchase_orders')
      .update({ status: 'cancelled' })
      .eq('id', data.purchaseOrderId)
      .eq('school_id', data.schoolId)
      .in('status', ['draft', 'submitted']);

    if (error) {
      throw error;
    }

    revalidatePurchaseOrderPaths();
    return { success: true };
  },
  { schema: CancelPurchaseOrderSchema },
);

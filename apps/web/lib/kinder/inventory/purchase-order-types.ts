import type { Database } from '~/lib/database.types';

export type PurchaseOrder =
  Database['public']['Tables']['purchase_orders']['Row'];

export type PurchaseOrderItem =
  Database['public']['Tables']['purchase_order_items']['Row'];

export type PurchaseOrderWithItems = PurchaseOrder & {
  items: Array<
    PurchaseOrderItem & {
      product: { id: string; name: string; unit: string; sku: string | null } | null;
    }
  >;
  supplier: { id: string; name: string } | null;
};

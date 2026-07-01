import type { Database } from '~/lib/database.types';

export type InventoryCategory =
  Database['public']['Tables']['inventory_categories']['Row'];

export type InventorySupplier =
  Database['public']['Tables']['inventory_suppliers']['Row'];

export type InventoryProduct =
  Database['public']['Tables']['inventory_products']['Row'];

export type InventoryTransaction =
  Database['public']['Tables']['inventory_transactions']['Row'];

export type InventoryProductWithStock = InventoryProduct & {
  quantity: number;
  isLowStock: boolean;
};

export type InventorySummary = {
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
};

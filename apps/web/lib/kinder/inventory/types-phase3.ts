import type { Database } from '~/lib/database.types';

export type StockCount = Database['public']['Tables']['stock_counts']['Row'];

export type StockCountItem =
  Database['public']['Tables']['stock_count_items']['Row'] & {
    product: { name: string; unit: string } | null;
  };

export type StockCountWithItems = StockCount & {
  items: StockCountItem[];
};

export type ExpiringBatch = {
  productId: string;
  productName: string;
  unit: string;
  expiryDate: string;
  quantity: number;
  daysUntilExpiry: number;
};

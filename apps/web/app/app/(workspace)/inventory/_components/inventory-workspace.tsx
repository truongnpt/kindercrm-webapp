'use client';

import {
  ArrowLeftRight,
  ClipboardList,
  Package,
  ShoppingCart,
  Truck,
  Warehouse,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type {
  InventoryProductWithStock,
  InventorySummary,
  InventoryTransaction,
  PurchaseOrder,
  Supplier,
} from '~/lib/kinder/inventory/types';
import type {
  StockCount,
  StockCountWithItems,
} from '~/lib/kinder/inventory/types-phase3';

import { CreatePurchaseOrderDialog } from './create-purchase-order-dialog';
import { CreateProductDialog } from './create-product-dialog';
import { CreateStockCountDialog } from './create-stock-count-dialog';
import { CreateSupplierDialog } from './create-supplier-dialog';
import { ProductsList } from './products-list';
import { PurchaseOrdersList } from './purchase-orders-list';
import { RecordTransactionDialog } from './record-transaction-dialog';
import { StockCountsPanel } from './stock-counts-panel';
import { SuppliersList } from './suppliers-list';
import { TransactionsList } from './transactions-list';
import { TransferStockPanel } from './transfer-stock-panel';

export function InventoryWorkspace({
  schoolId,
  defaultTab,
  products,
  transactions,
  suppliers,
  purchaseOrders,
  stockCounts,
  activeStockCount,
}: {
  schoolId: string;
  defaultTab: string;
  products: InventoryProductWithStock[];
  transactions: InventoryTransaction[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockCounts: StockCount[];
  activeStockCount: StockCountWithItems | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathsConfig.app.inventory}?${params.toString()}`);
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:inventory.workspaceHint" />}
          title={<Trans i18nKey="kinder:inventory.workspaceTitle" />}
        />
      </div>

      <TabbedModule
        className="min-w-0 gap-0 p-4 sm:p-6"
        defaultValue={defaultTab}
        onValueChange={setTab}
        value={activeTab}
      >
        <TabbedModuleList className="mb-4 flex-wrap">
          <TabbedModuleTrigger value="products">
            <Package className="mr-2 size-4" />
            <Trans i18nKey="kinder:inventory.tabs.products" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="transactions">
            <Warehouse className="mr-2 size-4" />
            <Trans i18nKey="kinder:inventory.tabs.transactions" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="suppliers">
            <Truck className="mr-2 size-4" />
            <Trans i18nKey="kinder:inventory.tabs.suppliers" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="purchaseOrders">
            <ShoppingCart className="mr-2 size-4" />
            <Trans i18nKey="kinder:inventory.tabs.purchaseOrders" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="stockCounts">
            <ClipboardList className="mr-2 size-4" />
            <Trans i18nKey="kinder:inventory.tabs.stockCounts" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="transfer">
            <ArrowLeftRight className="mr-2 size-4" />
            <Trans i18nKey="kinder:inventory.tabs.transfer" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent value="products">
          <div className="mb-4 flex justify-end">
            <CreateProductDialog schoolId={schoolId} />
          </div>
          <ProductsList products={products} schoolId={schoolId} />
        </TabbedModuleContent>

        <TabbedModuleContent value="transactions">
          <div className="mb-4 flex justify-end">
            <RecordTransactionDialog products={products} schoolId={schoolId} />
          </div>
          <TransactionsList transactions={transactions} />
        </TabbedModuleContent>

        <TabbedModuleContent value="suppliers">
          <div className="mb-4 flex justify-end">
            <CreateSupplierDialog schoolId={schoolId} />
          </div>
          <SuppliersList schoolId={schoolId} suppliers={suppliers} />
        </TabbedModuleContent>

        <TabbedModuleContent value="purchaseOrders">
          <div className="mb-4 flex justify-end">
            <CreatePurchaseOrderDialog
              products={products}
              schoolId={schoolId}
              suppliers={suppliers}
            />
          </div>
          <PurchaseOrdersList orders={purchaseOrders} schoolId={schoolId} />
        </TabbedModuleContent>

        <TabbedModuleContent value="stockCounts">
          <div className="mb-4 flex justify-end">
            <CreateStockCountDialog schoolId={schoolId} />
          </div>
          <StockCountsPanel
            activeCount={activeStockCount}
            schoolId={schoolId}
            stockCounts={stockCounts}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="transfer">
          <TransferStockPanel products={products} schoolId={schoolId} />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}

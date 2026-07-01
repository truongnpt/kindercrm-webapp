import { PageBody, PageHeader } from '@kit/ui/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

import {
  loadInventorySummary,
  loadInventoryTransactions,
  loadProductsWithStock,
  loadSuppliers,
} from '~/lib/kinder/inventory/load-inventory';
import { loadPurchaseOrders } from '~/lib/kinder/inventory/load-purchase-orders';
import {
  loadExpiringBatches,
  loadStockCounts,
  loadStockCountWithItems,
} from '~/lib/kinder/inventory/load-inventory-phase3';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { PurchaseOrdersPanel } from './_components/purchase-orders-panel';
import { ProductsPanel } from './_components/products-panel';
import { SuppliersPanel } from './_components/suppliers-panel';
import { TransactionsPanel } from './_components/transactions-panel';
import { StockCountsPanel } from './_components/stock-counts-panel';
import { TransferStockPanel } from './_components/transfer-stock-panel';
import { ExpiryAlertsBanner } from './_components/expiry-alerts-banner';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:inventory.title'),
  };
};

async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; countId?: string }>;
}) {
  const { tab, countId } = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'inventory');

  const [summary, products, transactions, suppliers, purchaseOrders, stockCounts, expiringBatches] =
    await Promise.all([
    loadInventorySummary(context.school.id),
    loadProductsWithStock(context.school.id),
    loadInventoryTransactions(context.school.id),
    loadSuppliers(context.school.id),
    loadPurchaseOrders(context.school.id),
    loadStockCounts(context.school.id),
    loadExpiringBatches(context.school.id),
  ]);

  const draftStockCount = stockCounts.find((count) => count.status === 'draft');
  const activeStockCountId = countId ?? draftStockCount?.id;
  const activeStockCount = activeStockCountId
    ? await loadStockCountWithItems(
        context.school.id,
        activeStockCountId,
      ).catch(() => null)
    : null;

  return (
    <>
      <PageHeader
        description={<Trans i18nKey="kinder:inventory.description" />}
        title={<Trans i18nKey="kinder:inventory.title" />}
      />

      <PageBody>
        <ExpiryAlertsBanner batches={expiringBatches} />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-xs">
              <Trans i18nKey="kinder:inventory.summary.products" />
            </p>
            <p className="text-2xl font-semibold">{summary.totalProducts}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-xs">
              <Trans i18nKey="kinder:inventory.summary.lowStock" />
            </p>
            <p className="text-2xl font-semibold">{summary.lowStockCount}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-muted-foreground text-xs">
              <Trans i18nKey="kinder:inventory.summary.totalUnits" />
            </p>
            <p className="text-2xl font-semibold">{summary.totalStockValue}</p>
          </div>
        </div>

        <Tabs defaultValue={tab ?? 'products'}>
          <TabsList>
            <TabsTrigger value="products">
              <Trans i18nKey="kinder:inventory.tabs.products" />
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Trans i18nKey="kinder:inventory.tabs.transactions" />
            </TabsTrigger>
            <TabsTrigger value="suppliers">
              <Trans i18nKey="kinder:inventory.tabs.suppliers" />
            </TabsTrigger>
            <TabsTrigger value="purchaseOrders">
              <Trans i18nKey="kinder:inventory.tabs.purchaseOrders" />
            </TabsTrigger>
            <TabsTrigger value="stockCounts">
              <Trans i18nKey="kinder:inventory.tabs.stockCounts" />
            </TabsTrigger>
            <TabsTrigger value="transfer">
              <Trans i18nKey="kinder:inventory.tabs.transfer" />
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="products">
            <ProductsPanel products={products} schoolId={context.school.id} />
          </TabsContent>

          <TabsContent className="mt-4" value="transactions">
            <TransactionsPanel
              products={products}
              schoolId={context.school.id}
              transactions={transactions}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="suppliers">
            <SuppliersPanel
              schoolId={context.school.id}
              suppliers={suppliers}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="purchaseOrders">
            <PurchaseOrdersPanel
              orders={purchaseOrders}
              products={products}
              schoolId={context.school.id}
              suppliers={suppliers}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="stockCounts">
            <StockCountsPanel
              activeCount={activeStockCount}
              schoolId={context.school.id}
              stockCounts={stockCounts}
            />
          </TabsContent>

          <TabsContent className="mt-4" value="transfer">
            <TransferStockPanel products={products} schoolId={context.school.id} />
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

export default withI18n(InventoryPage);

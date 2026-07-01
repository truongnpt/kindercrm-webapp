import { Trans } from '@kit/ui/trans';

import {
  KinderPageBody,
  KinderPageHeader,
  MiniStatCard,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';

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

import { CreatePurchaseOrderDialog } from './_components/create-purchase-order-dialog';
import { CreateProductDialog } from './_components/create-product-dialog';
import { CreateStockCountDialog } from './_components/create-stock-count-dialog';
import { CreateSupplierDialog } from './_components/create-supplier-dialog';
import { ProductsList } from './_components/products-list';
import { PurchaseOrdersList } from './_components/purchase-orders-list';
import { RecordTransactionDialog } from './_components/record-transaction-dialog';
import { SuppliersList } from './_components/suppliers-list';
import { TransactionsList } from './_components/transactions-list';
import { StockCountsPanel } from './_components/stock-counts-panel';
import { TransferStockDialog } from './_components/transfer-stock-dialog';
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
      <KinderPageHeader
        description={<Trans i18nKey="kinder:inventory.description" />}
        title={<Trans i18nKey="kinder:inventory.title" />}
      />

      <KinderPageBody>
        <ExpiryAlertsBanner batches={expiringBatches} />

        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStatCard
            labelKey="kinder:inventory.summary.products"
            value={String(summary.totalProducts)}
          />
          <MiniStatCard
            labelKey="kinder:inventory.summary.lowStock"
            value={String(summary.lowStockCount)}
          />
          <MiniStatCard
            labelKey="kinder:inventory.summary.totalUnits"
            value={String(summary.totalStockValue)}
          />
        </div>

        <TabbedModule defaultValue={tab ?? 'products'}>
          <TabbedModuleList className="flex-wrap">
            <TabbedModuleTrigger value="products">
              <Trans i18nKey="kinder:inventory.tabs.products" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="transactions">
              <Trans i18nKey="kinder:inventory.tabs.transactions" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="suppliers">
              <Trans i18nKey="kinder:inventory.tabs.suppliers" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="purchaseOrders">
              <Trans i18nKey="kinder:inventory.tabs.purchaseOrders" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="stockCounts">
              <Trans i18nKey="kinder:inventory.tabs.stockCounts" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="transfer">
              <Trans i18nKey="kinder:inventory.tabs.transfer" />
            </TabbedModuleTrigger>
          </TabbedModuleList>

          <TabbedModuleContent value="products">
            <div className="mb-4 flex justify-end">
              <CreateProductDialog schoolId={context.school.id} />
            </div>
            <ProductsList products={products} schoolId={context.school.id} />
          </TabbedModuleContent>

          <TabbedModuleContent value="transactions">
            <div className="mb-4 flex justify-end">
              <RecordTransactionDialog
                products={products}
                schoolId={context.school.id}
              />
            </div>
            <TransactionsList transactions={transactions} />
          </TabbedModuleContent>

          <TabbedModuleContent value="suppliers">
            <div className="mb-4 flex justify-end">
              <CreateSupplierDialog schoolId={context.school.id} />
            </div>
            <SuppliersList
              schoolId={context.school.id}
              suppliers={suppliers}
            />
          </TabbedModuleContent>

          <TabbedModuleContent value="purchaseOrders">
            <div className="mb-4 flex justify-end">
              <CreatePurchaseOrderDialog
                products={products}
                schoolId={context.school.id}
                suppliers={suppliers}
              />
            </div>
            <PurchaseOrdersList
              orders={purchaseOrders}
              schoolId={context.school.id}
            />
          </TabbedModuleContent>

          <TabbedModuleContent value="stockCounts">
            <div className="mb-4 flex justify-end">
              <CreateStockCountDialog schoolId={context.school.id} />
            </div>
            <StockCountsPanel
              activeCount={activeStockCount}
              schoolId={context.school.id}
              stockCounts={stockCounts}
            />
          </TabbedModuleContent>

          <TabbedModuleContent value="transfer">
            <div className="mb-4 flex justify-end">
              <TransferStockDialog
                products={products}
                schoolId={context.school.id}
              />
            </div>
          </TabbedModuleContent>
        </TabbedModule>
      </KinderPageBody>
    </>
  );
}

export default withI18n(InventoryPage);

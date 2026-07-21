import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
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
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { ExpiryAlertsBanner } from './_components/expiry-alerts-banner';
import { InventoryExport } from './_components/inventory-export';
import { InventoryOverview } from './_components/inventory-overview';
import { InventoryWorkspace } from './_components/inventory-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:inventory.title'),
  };
};

async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; countId?: string; lowStock?: string }>;
}) {
  const params = await searchParams;
  const { tab, countId } = params;
  const lowStockOnly = params.lowStock === '1';
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'inventory');
  await assertModuleAccessFromContext(context, pathsConfig.app.inventory, 'view');

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
        actions={<InventoryExport products={products} />}
        breadcrumbs={[{ label: <Trans i18nKey="kinder:inventory.title" /> }]}
        description={<Trans i18nKey="kinder:inventory.description" />}
        title={<Trans i18nKey="kinder:inventory.title" />}
      />

      <KinderPageBody>
        <ExpiryAlertsBanner batches={expiringBatches} />
        {/* <InventoryOverview summary={summary} /> */}
        <InventoryWorkspace
          activeStockCount={activeStockCount}
          defaultTab={tab ?? 'products'}
          lowStockOnly={lowStockOnly}
          products={products}
          purchaseOrders={purchaseOrders}
          schoolId={context.school.id}
          stockCounts={stockCounts}
          suppliers={suppliers}
          transactions={transactions}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(InventoryPage);

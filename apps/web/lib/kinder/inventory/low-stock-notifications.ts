import 'server-only';

import pathsConfig from '~/config/paths.config';

import { notifyStaffUsers, loadSchoolStaffUserIds } from '../notifications/staff-notifications';

import { loadProductsWithStock } from './load-inventory';

export async function checkAndNotifyLowStockProducts(
  schoolId: string,
  productIds: string[],
) {
  const uniqueIds = [...new Set(productIds)].filter(Boolean);

  if (uniqueIds.length === 0) {
    return;
  }

  const products = await loadProductsWithStock(schoolId);
  const lowStockProducts = products.filter(
    (product) => uniqueIds.includes(product.id) && product.isLowStock,
  );

  if (lowStockProducts.length === 0) {
    return;
  }

  const staffUserIds = await loadSchoolStaffUserIds(schoolId);
  const linkUrl = `${pathsConfig.app.inventory}?tab=products&lowStock=1`;

  await Promise.all(
    lowStockProducts.map((product) =>
      notifyStaffUsers({
        schoolId,
        userIds: staffUserIds,
        category: 'inventory',
        title: `Sắp hết kho: ${product.name}`,
        body: `Tồn ${product.quantity} ${product.unit} (tối thiểu ${product.min_quantity}).`,
        linkUrl,
        referenceType: 'inventory_product',
        referenceId: product.id,
        skipIfUnreadDuplicate: true,
      }),
    ),
  );
}

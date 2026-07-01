'use client';

import { useState } from 'react';

import { Package } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  EntityRowActions,
  StatusBadge,
} from '~/components/kinder-ui';
import type { InventoryProductWithStock } from '~/lib/kinder/inventory/types';

import { EditProductDialog } from './edit-product-dialog';

export function ProductsList({
  products,
  schoolId,
}: {
  products: InventoryProductWithStock[];
  schoolId: string;
}) {
  const [editProduct, setEditProduct] =
    useState<InventoryProductWithStock | null>(null);

  if (products.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:inventory.emptyProductsDescription"
        icon={Package}
        titleKey="kinder:inventory.emptyProducts"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={
            <Trans i18nKey="kinder:inventory.productsListDescription" />
          }
          title={<Trans i18nKey="kinder:inventory.tabs.products" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:inventory.productName" />
                </th>
                <th>
                  <Trans i18nKey="kinder:inventory.sku" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:inventory.quantity" />
                </th>
                <th>
                  <Trans i18nKey="kinder:inventory.lowStock" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:mealMenu.actions" />
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="font-medium">{product.name}</td>
                  <td className="text-muted-foreground font-mono text-xs">
                    {product.sku ?? '—'}
                  </td>
                  <td className="text-right">
                    {product.quantity} {product.unit}
                  </td>
                  <td>
                    <StatusBadge tone={product.isLowStock ? 'danger' : 'success'}>
                      <Trans
                        i18nKey={
                          product.isLowStock ?
                            'kinder:inventory.lowStock'
                          : 'kinder:inventory.inStock'
                        }
                      />
                    </StatusBadge>
                  </td>
                  <td className="text-right">
                    <EntityRowActions
                      onEdit={() => setEditProduct(product)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <article className="kinder-mobile-card" key={product.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{product.name}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {product.sku ?? '—'}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  {product.quantity} {product.unit}
                </p>
              </div>
              <StatusBadge tone={product.isLowStock ? 'danger' : 'success'}>
                <Trans
                  i18nKey={
                    product.isLowStock ?
                      'kinder:inventory.lowStock'
                    : 'kinder:inventory.inStock'
                  }
                />
              </StatusBadge>
            </div>
            <EntityRowActions onEdit={() => setEditProduct(product)} />
          </article>
        ))}
      </div>

      {editProduct ? (
        <EditProductDialog
          onOpenChange={(open) => {
            if (!open) {
              setEditProduct(null);
            }
          }}
          open
          product={editProduct}
          schoolId={schoolId}
        />
      ) : null}
    </>
  );
}

'use client';

import { useState } from 'react';

import { Truck } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  EntityRowActions,
} from '~/components/kinder-ui';
import type { InventorySupplier } from '~/lib/kinder/inventory/types';

import { EditSupplierDialog } from './edit-supplier-dialog';

export function SuppliersList({
  suppliers,
  schoolId,
}: {
  suppliers: InventorySupplier[];
  schoolId: string;
}) {
  const [editSupplier, setEditSupplier] = useState<InventorySupplier | null>(
    null,
  );

  if (suppliers.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:inventory.emptySuppliersDescription"
        icon={Truck}
        titleKey="kinder:inventory.emptySuppliers"
      />
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <DataTableCard
          description={
            <Trans i18nKey="kinder:inventory.suppliersListDescription" />
          }
          title={<Trans i18nKey="kinder:inventory.tabs.suppliers" />}
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:inventory.supplier" />
                </th>
                <th>
                  <Trans i18nKey="kinder:schoolSettings.phone" />
                </th>
                <th>
                  <Trans i18nKey="kinder:schoolSettings.email" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:mealMenu.actions" />
                </th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="font-medium">{supplier.name}</td>
                  <td className="text-muted-foreground">
                    {supplier.phone ?? '—'}
                  </td>
                  <td className="text-muted-foreground">
                    {supplier.email ?? '—'}
                  </td>
                  <td className="text-right">
                    <EntityRowActions
                      onEdit={() => setEditSupplier(supplier)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>
      </div>

      <div className="space-y-3 md:hidden">
        {suppliers.map((supplier) => (
          <article className="kinder-mobile-card" key={supplier.id}>
            <p className="font-medium">{supplier.name}</p>
            {supplier.phone ? (
              <p className="text-muted-foreground mt-1 text-sm">
                {supplier.phone}
              </p>
            ) : null}
            {supplier.email ? (
              <p className="text-muted-foreground text-sm">{supplier.email}</p>
            ) : null}
            <div className="mt-3">
              <EntityRowActions onEdit={() => setEditSupplier(supplier)} />
            </div>
          </article>
        ))}
      </div>

      {editSupplier ? (
        <EditSupplierDialog
          onOpenChange={(open) => {
            if (!open) {
              setEditSupplier(null);
            }
          }}
          open
          schoolId={schoolId}
          supplier={editSupplier}
        />
      ) : null}
    </>
  );
}

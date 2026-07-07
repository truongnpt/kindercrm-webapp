'use client';

import { Check, Minus } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { SectionCard } from '~/components/kinder-ui';
import {
  getComparisonRowLabelKey,
  getPackageComparisonCell,
  PLAN_COMPARISON_ROWS,
} from '~/lib/kinder/subscription/package-plan-display';
import type { Package } from '~/lib/kinder/types';

import { PlanQuotaCell } from './plan-quota-label';

export function PackageComparisonTable({
  packages,
  currentPackageId,
}: {
  packages: Package[];
  currentPackageId: string | null;
}) {
  if (packages.length === 0) {
    return null;
  }

  return (
    <SectionCard className="min-w-0 overflow-hidden p-0">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h3 className="text-foreground text-base font-semibold">
          <Trans i18nKey="kinder:subscription.comparison.title" />
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          <Trans i18nKey="kinder:subscription.comparison.hint" />
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-muted-foreground px-4 py-3 text-left font-medium sm:px-6">
                <Trans i18nKey="kinder:subscription.comparison.feature" />
              </th>
              {packages.map((pkg) => (
                <th
                  className="px-4 py-3 text-center font-semibold sm:px-6"
                  key={pkg.id}
                >
                  <span className="block">{pkg.name}</span>
                  {pkg.id === currentPackageId ? (
                    <span className="text-primary mt-1 block text-xs font-normal">
                      <Trans i18nKey="kinder:subscription.current" />
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARISON_ROWS.map((row) => (
              <tr className="border-b border-border/60 last:border-0" key={
                row.kind === 'quota' ? `quota-${row.key}` : row.key
              }>
                <td className="text-muted-foreground px-4 py-3 sm:px-6">
                  <Trans i18nKey={getComparisonRowLabelKey(row)} />
                </td>
                {packages.map((pkg) => {
                  const cell = getPackageComparisonCell(pkg, row);

                  return (
                    <td className="px-4 py-3 text-center sm:px-6" key={pkg.id}>
                      {row.kind === 'quota' && cell.type === 'quota' ? (
                        <PlanQuotaCell quotaKey={row.key} value={cell.value} />
                      ) : cell.type === 'boolean' && cell.included ? (
                        <Check
                          aria-label="included"
                          className="text-primary mx-auto size-4"
                        />
                      ) : (
                        <Minus
                          aria-label="not included"
                          className="text-muted-foreground/50 mx-auto size-4"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

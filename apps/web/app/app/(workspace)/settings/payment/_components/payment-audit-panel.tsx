'use client';

import { Trans } from '@kit/ui/trans';

import { DataTableShell, PanelEmpty } from '~/components/kinder-ui';
import type { PaymentAuditLog } from '~/lib/kinder/payment-settings/types';

export function PaymentAuditPanel({ logs }: { logs: PaymentAuditLog[] }) {
  if (logs.length === 0) {
    return <PanelEmpty messageKey="kinder:paymentSettings.auditEmpty" />;
  }

  return (
    <DataTableShell>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                <Trans i18nKey="kinder:paymentSettings.auditAction" />
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <Trans i18nKey="kinder:paymentSettings.auditEntity" />
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <Trans i18nKey="kinder:paymentSettings.auditTime" />
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr className="border-t border-border" key={log.id}>
                <td className="px-4 py-3">
                  <Trans
                    i18nKey={`kinder:paymentSettings.auditActions.${log.action}`}
                    defaults={log.action}
                  />
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {log.entity_type}
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataTableShell>
  );
}

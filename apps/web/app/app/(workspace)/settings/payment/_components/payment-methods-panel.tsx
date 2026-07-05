'use client';

import { Switch } from '@kit/ui/switch';
import { Trans } from '@kit/ui/trans';

import { DataTableShell } from '~/components/kinder-ui';
import { updatePaymentMethodAction } from '~/lib/kinder/payment-settings/server-actions';
import type { SchoolPaymentMethod } from '~/lib/kinder/payment-settings/types';

export function PaymentMethodsPanel({
  schoolId,
  methods,
}: {
  schoolId: string;
  methods: SchoolPaymentMethod[];
}) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey="kinder:paymentSettings.methodsHint" />
      </p>

      <DataTableShell>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:paymentSettings.method" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:paymentSettings.enabled" />
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  <Trans i18nKey="kinder:paymentSettings.default" />
                </th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method) => (
                <tr className="border-t border-border" key={method.id}>
                  <td className="px-4 py-3">
                    <Trans
                      i18nKey={`kinder:paymentSettings.methodTypes.${method.method}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={method.is_enabled}
                      onCheckedChange={async (checked) => {
                        await updatePaymentMethodAction({
                          schoolId,
                          methodId: method.id,
                          isEnabled: checked,
                        });
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={method.is_default}
                      disabled={!method.is_enabled}
                      onCheckedChange={async (checked) => {
                        if (!checked) {
                          return;
                        }

                        await updatePaymentMethodAction({
                          schoolId,
                          methodId: method.id,
                          isEnabled: true,
                          isDefault: true,
                        });
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataTableShell>
    </div>
  );
}

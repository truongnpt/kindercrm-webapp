'use client';

import { Trans } from '@kit/ui/trans';

import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { FinanceReportSummary } from '~/lib/kinder/finance/types';

export function FinanceReportsPanel({
  report,
}: {
  report: FinanceReportSummary;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            key: 'totalRevenue',
            value: formatVnd(report.totalRevenue),
          },
          {
            key: 'totalOutstanding',
            value: formatVnd(report.totalOutstanding),
          },
          {
            key: 'paidCount',
            value: String(report.paidCount),
          },
          {
            key: 'unpaidCount',
            value: String(report.unpaidCount),
          },
        ].map((item) => (
          <div
            className="rounded-xl border border-border bg-card p-4"
            key={item.key}
          >
            <p className="text-muted-foreground text-sm">
              <Trans i18nKey={`kinder:finance.reports.${item.key}`} />
            </p>
            <p className="mt-2 text-xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-medium">
            <Trans i18nKey="kinder:finance.reports.byClass" />
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr>
                  <th className="py-2 text-left font-medium">
                    <Trans i18nKey="kinder:finance.reports.class" />
                  </th>
                  <th className="py-2 text-right font-medium">
                    <Trans i18nKey="kinder:finance.reports.outstanding" />
                  </th>
                  <th className="py-2 text-right font-medium">
                    <Trans i18nKey="kinder:finance.reports.collected" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.byClass.map((row) => (
                  <tr className="border-t border-border" key={row.name}>
                    <td className="py-2">{row.name}</td>
                    <td className="py-2 text-right">
                      {formatVnd(row.outstanding)}
                    </td>
                    <td className="py-2 text-right">{formatVnd(row.paid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-medium">
            <Trans i18nKey="kinder:finance.reports.byMonth" />
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr>
                  <th className="py-2 text-left font-medium">
                    <Trans i18nKey="kinder:finance.invoices.period" />
                  </th>
                  <th className="py-2 text-right font-medium">
                    <Trans i18nKey="kinder:finance.reports.invoices" />
                  </th>
                  <th className="py-2 text-right font-medium">
                    <Trans i18nKey="kinder:finance.reports.collected" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.byMonth.map((row) => (
                  <tr className="border-t border-border" key={row.period}>
                    <td className="py-2">{row.period}</td>
                    <td className="py-2 text-right">{row.invoices}</td>
                    <td className="py-2 text-right">
                      {formatVnd(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

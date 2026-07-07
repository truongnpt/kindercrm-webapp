'use client';

import { Download } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Button } from '@kit/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@kit/ui/chart';
import { Trans } from '@kit/ui/trans';

import { PlatformSectionCard } from '~/components/platform-console';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { buildCsv, downloadCsv } from '~/lib/kinder/export/csv';
import type { PlatformSubscriptionAnalytics } from '~/lib/kinder/platform/load-platform-subscription-analytics';

const revenueChartConfig = {
  revenueCollected: {
    label: 'Doanh thu',
    color: 'hsl(var(--primary))',
  },
};

const funnelChartConfig = {
  newTrials: {
    label: 'Trial mới',
    color: 'hsl(217 91% 60%)',
  },
  conversions: {
    label: 'Chuyển đổi',
    color: 'hsl(142 71% 45%)',
  },
  churn: {
    label: 'Churn',
    color: 'hsl(0 84% 60%)',
  },
};

function formatCompactVnd(value: number) {
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}tr`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }

  return String(value);
}

export function PlatformSubscriptionAnalyticsPanel({
  analytics,
}: {
  analytics: PlatformSubscriptionAnalytics;
}) {
  const exportCsv = () => {
    const headers = [
      'month',
      'revenue_collected_vnd',
      'new_trials',
      'conversions',
      'churn',
    ];

    const rows = analytics.months.map((row) => [
      row.month,
      row.revenueCollected,
      row.newTrials,
      row.conversions,
      row.churn,
    ]);

    rows.push([]);
    rows.push([
      'snapshot_estimated_mrr_vnd',
      analytics.snapshot.estimatedMrr,
      analytics.snapshot.trialSchools,
      analytics.snapshot.activePaidSchools,
      analytics.snapshot.trialConversionRate,
    ]);

    const csv = buildCsv(headers, rows);
    downloadCsv(`kinder-platform-analytics-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      <PlatformSectionCard
        action={
          <Button onClick={exportCsv} size="sm" type="button" variant="outline">
            <Download className="mr-2 size-4" />
            <Trans i18nKey="kinder:platform.analytics.exportCsv" />
          </Button>
        }
        title={<Trans i18nKey="kinder:platform.analytics.title" />}
      >
        <p className="text-muted-foreground mb-6 text-sm">
          <Trans i18nKey="kinder:platform.analytics.hint" />
        </p>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsStat
            labelKey="kinder:platform.analytics.estimatedMrr"
            value={formatVnd(analytics.snapshot.estimatedMrr)}
          />
          <AnalyticsStat
            labelKey="kinder:platform.analytics.trialConversion"
            value={`${analytics.snapshot.trialConversionRate}%`}
          />
          <AnalyticsStat
            labelKey="kinder:platform.analytics.churn30d"
            value={`${analytics.snapshot.churnRate30d}%`}
          />
          <AnalyticsStat
            labelKey="kinder:platform.analytics.activePaid"
            value={String(analytics.snapshot.activePaidSchools)}
          />
        </div>
      </PlatformSectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <PlatformSectionCard
          title={<Trans i18nKey="kinder:platform.analytics.revenueChart" />}
        >
          <ChartContainer className="h-[280px] w-full" config={revenueChartConfig}>
            <BarChart data={analytics.months}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="monthLabel"
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickFormatter={formatCompactVnd}
                tickLine={false}
                width={48}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatVnd(Number(value))}
                  />
                }
              />
              <Bar
                dataKey="revenueCollected"
                fill="var(--color-revenueCollected)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </PlatformSectionCard>

        <PlatformSectionCard
          title={<Trans i18nKey="kinder:platform.analytics.funnelChart" />}
        >
          <ChartContainer className="h-[280px] w-full" config={funnelChartConfig}>
            <BarChart data={analytics.months}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="monthLabel"
                tickLine={false}
                tickMargin={8}
              />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="newTrials" fill="var(--color-newTrials)" radius={4} />
              <Bar dataKey="conversions" fill="var(--color-conversions)" radius={4} />
              <Bar dataKey="churn" fill="var(--color-churn)" radius={4} />
            </BarChart>
          </ChartContainer>
        </PlatformSectionCard>
      </div>
    </div>
  );
}

function AnalyticsStat({
  labelKey,
  value,
}: {
  labelKey: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <p className="text-muted-foreground text-sm">
        <Trans i18nKey={labelKey} />
      </p>
      <p className="text-foreground mt-2 text-2xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

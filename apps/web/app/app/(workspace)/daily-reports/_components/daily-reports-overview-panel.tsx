'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { ChevronRight } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { DataTableCard, PanelEmpty, StatusBadge } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { DailyReportsClassSummary } from '~/lib/kinder/daily-reports/types';

function completionRate(summary: DailyReportsClassSummary) {
  if (summary.totalStudents === 0) {
    return 0;
  }

  return Math.round((summary.publishedCount / summary.totalStudents) * 100);
}

export function DailyReportsOverviewPanel({
  summaries,
  reportDate,
}: {
  summaries: DailyReportsClassSummary[];
  reportDate: string;
}) {
  const searchParams = useSearchParams();

  if (summaries.length === 0) {
    return <PanelEmpty messageKey="kinder:dailyReports.noClasses" />;
  }

  return (
    <DataTableCard
      description={<Trans i18nKey="kinder:dailyReports.overviewHint" />}
      title={<Trans i18nKey="kinder:dailyReports.tabs.overview" />}
    >
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:dailyReports.class" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:dailyReports.stats.enrolled" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:dailyReports.stats.published" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:dailyReports.stats.draft" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:dailyReports.stats.missing" />
            </th>
            <th className="px-4 py-3 text-left font-medium">
              <Trans i18nKey="kinder:dailyReports.stats.completionLabel" />
            </th>
            <th className="px-4 py-3 text-right font-medium" />
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary) => {
            const rate = completionRate(summary);
            const params = new URLSearchParams(searchParams.toString());
            params.set('tab', 'class');
            params.set('classId', summary.classId);
            params.set('date', reportDate);

            return (
              <tr key={summary.classId}>
                <td className="px-4 py-3">
                  <p className="font-medium">{summary.className}</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    {summary.classCode}
                  </p>
                </td>
                <td className="px-4 py-3 tabular-nums">{summary.totalStudents}</td>
                <td className="px-4 py-3 tabular-nums">
                  {summary.publishedCount}
                </td>
                <td className="px-4 py-3 tabular-nums">{summary.draftCount}</td>
                <td className="px-4 py-3 tabular-nums">
                  {summary.missingCount}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone={rate >= 80 ? 'success' : 'warning'}>
                    {rate}%
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild size="sm" type="button" variant="ghost">
                    <Link href={`${pathsConfig.app.dailyReports}?${params.toString()}`}>
                      <Trans i18nKey="kinder:dailyReports.openClass" />
                      <ChevronRight className="ml-1 size-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </DataTableCard>
  );
}

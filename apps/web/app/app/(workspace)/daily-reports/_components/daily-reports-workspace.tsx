'use client';

import { BarChart3, Users } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { ClassGroup } from '~/lib/kinder/classes/types';
import type {
  ClassDailyReportStudent,
  DailyReportsClassSummary,
} from '~/lib/kinder/daily-reports/types';

import { ClassDailyReportsPanel } from './class-daily-reports-panel';
import { DailyReportFilters } from './daily-report-filters';
import { DailyReportsOverviewPanel } from './daily-reports-overview-panel';

export function DailyReportsWorkspace({
  schoolId,
  defaultTab,
  classes,
  classId,
  reportDate,
  roster,
  classSummaries,
  aiEnabled,
}: {
  schoolId: string;
  defaultTab: string;
  classes: ClassGroup[];
  classId?: string;
  reportDate: string;
  roster: ClassDailyReportStudent[];
  classSummaries: DailyReportsClassSummary[];
  aiEnabled: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathsConfig.app.dailyReports}?${params.toString()}`);
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:dailyReports.workspaceHint" />}
          title={<Trans i18nKey="kinder:dailyReports.workspaceTitle" />}
        />
      </div>

      <TabbedModule
        className="min-w-0 gap-0 p-4 sm:p-6"
        defaultValue={defaultTab}
        onValueChange={setTab}
        value={activeTab}
      >
        <DailyReportFilters classes={classes} />

        <TabbedModuleList className="mb-4 mt-4 flex-wrap">
          <TabbedModuleTrigger value="class">
            <Users className="mr-2 size-4" />
            <Trans i18nKey="kinder:dailyReports.tabs.class" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="overview">
            <BarChart3 className="mr-2 size-4" />
            <Trans i18nKey="kinder:dailyReports.tabs.overview" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent value="class">
          {classId ? (
            <ClassDailyReportsPanel
              aiEnabled={aiEnabled}
              classId={classId}
              key={`${classId}-${reportDate}`}
              reportDate={reportDate}
              roster={roster}
              schoolId={schoolId}
            />
          ) : null}
        </TabbedModuleContent>

        <TabbedModuleContent value="overview">
          <DailyReportsOverviewPanel
            reportDate={reportDate}
            summaries={classSummaries}
          />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}

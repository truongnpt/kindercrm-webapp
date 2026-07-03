import { BookOpen } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { EmptyState, KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  buildDailyReportsDaySummary,
  loadActiveClasses,
  loadDailyReportsExportRows,
  loadDailyReportsForClassDate,
  loadDailyReportsOverviewForDate,
} from '~/lib/kinder/daily-reports/load-daily-reports';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { hasSchoolFeature, requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { DailyReportsOverview } from './_components/daily-reports-overview';
import { DailyReportsExport } from './_components/daily-reports-export';
import { DailyReportsRemindStaff } from './_components/daily-reports-remind-staff';
import { DailyReportsWorkspace } from './_components/daily-reports-workspace';

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:dailyReports.title'),
  };
};

async function DailyReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    classId?: string;
    date?: string;
    tab?: string;
  }>;
}) {
  const params = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'daily_reports');
  await assertModuleAccessFromContext(
    context,
    pathsConfig.app.dailyReports,
    'view',
  );

  const classes = await loadActiveClasses(context.school.id);
  const classId = params.classId ?? classes[0]?.id;
  const reportDate = params.date ?? todayString();
  const defaultTab = params.tab ?? 'class';
  const selectedClass = classes.find((cls) => cls.id === classId);

  const [roster, classSummaries, exportRows] = await Promise.all([
    classId
      ? loadDailyReportsForClassDate(
          context.school.id,
          classId,
          reportDate,
        )
      : Promise.resolve([]),
    loadDailyReportsOverviewForDate(context.school.id, reportDate),
    loadDailyReportsExportRows(context.school.id, reportDate, classId),
  ]);

  const daySummary = buildDailyReportsDaySummary({
    reportDate,
    classId: classId ?? null,
    className: selectedClass?.name ?? null,
    roster,
    activeClasses: classes.length,
  });

  return (
    <>
      <KinderPageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DailyReportsRemindStaff
              reportDate={reportDate}
              schoolId={context.school.id}
              summaries={classSummaries}
            />
            <DailyReportsExport reportDate={reportDate} rows={exportRows} />
          </div>
        }
        breadcrumbs={[{ label: <Trans i18nKey="kinder:dailyReports.title" /> }]}
        description={<Trans i18nKey="kinder:dailyReports.description" />}
        title={<Trans i18nKey="kinder:dailyReports.title" />}
      />

      <KinderPageBody>
        {classes.length === 0 ? (
          <EmptyState
            descriptionKey="kinder:dailyReports.noClassesDescription"
            icon={BookOpen}
            titleKey="kinder:dailyReports.noClasses"
          />
        ) : (
          <>
            <DailyReportsOverview summary={daySummary} />
            <DailyReportsWorkspace
              aiEnabled={hasSchoolFeature(context, 'ai_assistant')}
              classId={classId}
              classSummaries={classSummaries}
              classes={classes}
              defaultTab={defaultTab}
              reportDate={reportDate}
              roster={roster}
              schoolId={context.school.id}
            />
          </>
        )}
      </KinderPageBody>
    </>
  );
}

export default withI18n(DailyReportsPage);

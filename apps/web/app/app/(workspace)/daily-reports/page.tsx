import { Suspense } from 'react';

import { BookOpen } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  EmptyState,
  KinderPageBody,
  KinderPageHeader,
} from '~/components/kinder-ui';

import {
  loadActiveClasses,
  loadDailyReportsForClassDate,
} from '~/lib/kinder/daily-reports/load-daily-reports';
import { hasSchoolFeature, requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { ClassDailyReportsPanel } from './_components/class-daily-reports-panel';
import { DailyReportFilters } from './_components/daily-report-filters';

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
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'daily_reports');

  const classes = await loadActiveClasses(context.school.id);
  const classId = params.classId ?? classes[0]?.id;
  const reportDate = params.date ?? todayString();

  const roster = classId
    ? await loadDailyReportsForClassDate(
        context.school.id,
        classId,
        reportDate,
      )
    : [];

  return (
    <>
      <KinderPageHeader
        description={<Trans i18nKey="kinder:dailyReports.description" />}
        title={<Trans i18nKey="kinder:dailyReports.title" />}
      />

      <KinderPageBody>
        {classes.length === 0 ? (
          <EmptyState
            descriptionKey="kinder:ui.emptyDefaultDescription"
            icon={BookOpen}
            titleKey="kinder:dailyReports.noClasses"
          />
        ) : (
          <div className="flex flex-col gap-4">
            <Suspense>
              <DailyReportFilters classes={classes} />
            </Suspense>

            {classId ? (
              <ClassDailyReportsPanel
                aiEnabled={hasSchoolFeature(context, 'ai_assistant')}
                classId={classId}
                key={`${classId}-${reportDate}`}
                reportDate={reportDate}
                roster={roster}
                schoolId={context.school.id}
              />
            ) : null}
          </div>
        )}
      </KinderPageBody>
    </>
  );
}

export default withI18n(DailyReportsPage);

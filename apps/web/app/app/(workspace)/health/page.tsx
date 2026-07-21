import { Users } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { EmptyState, KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  loadGrowthRecords,
  loadHealthDashboardSummary,
  loadHealthIncidents,
  loadHealthMedications,
  loadHealthStudents,
  loadMedicalCheckups,
  loadStudentHealthSummaries,
  loadVaccinations,
} from '~/lib/kinder/health/load-health';
import { loadHealthExportBundle } from '~/lib/kinder/health/load-health-export';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { HealthExport } from './_components/health-export';
import { HealthOverview } from './_components/health-overview';
import { HealthWorkspace } from './_components/health-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:health.title'),
  };
};

async function HealthPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; studentId?: string }>;
}) {
  const { tab, studentId } = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'health_management');
  await assertModuleAccessFromContext(context, pathsConfig.app.health, 'view');

  const schoolId = context.school.id;
  const filterStudentId = studentId && studentId !== 'all' ? studentId : undefined;

  const [
    students,
    summary,
    summaries,
    growth,
    vaccinations,
    checkups,
    medications,
    incidents,
    exportBundle,
  ] = await Promise.all([
    loadHealthStudents(schoolId),
    loadHealthDashboardSummary(schoolId),
    loadStudentHealthSummaries(schoolId),
    loadGrowthRecords(schoolId, filterStudentId),
    loadVaccinations(schoolId, filterStudentId),
    loadMedicalCheckups(schoolId, filterStudentId),
    loadHealthMedications(schoolId, filterStudentId),
    loadHealthIncidents(schoolId, filterStudentId),
    loadHealthExportBundle(schoolId, filterStudentId),
  ]);

  const defaultTab = tab ?? 'profiles';

  return (
    <>
      <KinderPageHeader
        actions={students.length > 0 ? <HealthExport bundle={exportBundle} /> : null}
        breadcrumbs={[{ label: <Trans i18nKey="kinder:health.title" /> }]}
        description={<Trans i18nKey="kinder:health.description" />}
        title={<Trans i18nKey="kinder:health.title" />}
      />

      <KinderPageBody>
        {students.length === 0 ? (
          <EmptyState
            descriptionKey="kinder:health.emptyStudentsDescription"
            icon={Users}
            titleKey="kinder:health.emptyStudents"
          />
        ) : (
          <>
            {/* <HealthOverview summary={summary} /> */}
            <HealthWorkspace
              checkups={checkups}
              defaultTab={defaultTab}
              filterStudentId={filterStudentId}
              growth={growth}
              incidents={incidents}
              medications={medications}
              schoolId={schoolId}
              students={students}
              summaries={summaries}
              summary={summary}
              vaccinations={vaccinations}
            />
          </>
        )}
      </KinderPageBody>
    </>
  );
}

export default withI18n(HealthPage);

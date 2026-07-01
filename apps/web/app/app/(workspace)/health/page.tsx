import { Suspense } from 'react';

import { Trans } from '@kit/ui/trans';

import {
  KinderPageBody,
  KinderPageHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';

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
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CheckupsPanel } from './_components/checkups-panel';
import { GrowthPanel } from './_components/growth-panel';
import { HealthDashboardPanel } from './_components/health-dashboard-panel';
import { HealthProfilesPanel } from './_components/health-profiles-panel';
import { IncidentsPanel } from './_components/incidents-panel';
import { MedicationsPanel } from './_components/medications-panel';
import { VaccinationsPanel } from './_components/vaccinations-panel';

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
  ] = await Promise.all([
    loadHealthStudents(schoolId),
    loadHealthDashboardSummary(schoolId),
    loadStudentHealthSummaries(schoolId),
    loadGrowthRecords(schoolId, filterStudentId),
    loadVaccinations(schoolId, filterStudentId),
    loadMedicalCheckups(schoolId, filterStudentId),
    loadHealthMedications(schoolId, filterStudentId),
    loadHealthIncidents(schoolId, filterStudentId),
  ]);

  const defaultTab = tab ?? 'dashboard';

  return (
    <>
      <KinderPageHeader
        description={<Trans i18nKey="kinder:health.description" />}
        title={<Trans i18nKey="kinder:health.title" />}
      />

      <KinderPageBody>
        <TabbedModule defaultValue={defaultTab}>
          <TabbedModuleList className="flex-wrap">
            <TabbedModuleTrigger value="dashboard">
              <Trans i18nKey="kinder:health.tabs.dashboard" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="profiles">
              <Trans i18nKey="kinder:health.tabs.profiles" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="growth">
              <Trans i18nKey="kinder:health.tabs.growth" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="vaccinations">
              <Trans i18nKey="kinder:health.tabs.vaccinations" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="checkups">
              <Trans i18nKey="kinder:health.tabs.checkups" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="medications">
              <Trans i18nKey="kinder:health.tabs.medications" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="incidents">
              <Trans i18nKey="kinder:health.tabs.incidents" />
            </TabbedModuleTrigger>
          </TabbedModuleList>

          <TabbedModuleContent value="dashboard">
            <HealthDashboardPanel summary={summary} />
          </TabbedModuleContent>

          <TabbedModuleContent value="profiles">
            <HealthProfilesPanel summaries={summaries} />
          </TabbedModuleContent>

          <TabbedModuleContent value="growth">
            <Suspense>
              <GrowthPanel
                records={growth}
                schoolId={schoolId}
                studentId={filterStudentId}
                students={students}
              />
            </Suspense>
          </TabbedModuleContent>

          <TabbedModuleContent value="vaccinations">
            <Suspense>
              <VaccinationsPanel
                schoolId={schoolId}
                studentId={filterStudentId}
                students={students}
                vaccinations={vaccinations}
              />
            </Suspense>
          </TabbedModuleContent>

          <TabbedModuleContent value="checkups">
            <Suspense>
              <CheckupsPanel
                checkups={checkups}
                schoolId={schoolId}
                studentId={filterStudentId}
                students={students}
              />
            </Suspense>
          </TabbedModuleContent>

          <TabbedModuleContent value="medications">
            <Suspense>
              <MedicationsPanel
                medications={medications}
                schoolId={schoolId}
                studentId={filterStudentId}
                students={students}
              />
            </Suspense>
          </TabbedModuleContent>

          <TabbedModuleContent value="incidents">
            <Suspense>
              <IncidentsPanel
                incidents={incidents}
                schoolId={schoolId}
                studentId={filterStudentId}
                students={students}
              />
            </Suspense>
          </TabbedModuleContent>
        </TabbedModule>
      </KinderPageBody>
    </>
  );
}

export default withI18n(HealthPage);

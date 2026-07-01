import { Suspense } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

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
      <PageHeader
        description={<Trans i18nKey="kinder:health.description" />}
        title={<Trans i18nKey="kinder:health.title" />}
      />

      <PageBody>
        <Tabs defaultValue={defaultTab}>
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="dashboard">
              <Trans i18nKey="kinder:health.tabs.dashboard" />
            </TabsTrigger>
            <TabsTrigger value="profiles">
              <Trans i18nKey="kinder:health.tabs.profiles" />
            </TabsTrigger>
            <TabsTrigger value="growth">
              <Trans i18nKey="kinder:health.tabs.growth" />
            </TabsTrigger>
            <TabsTrigger value="vaccinations">
              <Trans i18nKey="kinder:health.tabs.vaccinations" />
            </TabsTrigger>
            <TabsTrigger value="checkups">
              <Trans i18nKey="kinder:health.tabs.checkups" />
            </TabsTrigger>
            <TabsTrigger value="medications">
              <Trans i18nKey="kinder:health.tabs.medications" />
            </TabsTrigger>
            <TabsTrigger value="incidents">
              <Trans i18nKey="kinder:health.tabs.incidents" />
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="dashboard">
            <HealthDashboardPanel summary={summary} />
          </TabsContent>

          <TabsContent className="mt-4" value="profiles">
            <HealthProfilesPanel summaries={summaries} />
          </TabsContent>

          <TabsContent className="mt-4" value="growth">
            <Suspense>
              <GrowthPanel
                records={growth}
                schoolId={schoolId}
                studentId={filterStudentId}
                students={students}
              />
            </Suspense>
          </TabsContent>

          <TabsContent className="mt-4" value="vaccinations">
            <Suspense>
              <VaccinationsPanel
                schoolId={schoolId}
                studentId={filterStudentId}
                students={students}
                vaccinations={vaccinations}
              />
            </Suspense>
          </TabsContent>

          <TabsContent className="mt-4" value="checkups">
            <Suspense>
              <CheckupsPanel
                checkups={checkups}
                schoolId={schoolId}
                studentId={filterStudentId}
                students={students}
              />
            </Suspense>
          </TabsContent>

          <TabsContent className="mt-4" value="medications">
            <Suspense>
              <MedicationsPanel
                medications={medications}
                schoolId={schoolId}
                studentId={filterStudentId}
                students={students}
              />
            </Suspense>
          </TabsContent>

          <TabsContent className="mt-4" value="incidents">
            <Suspense>
              <IncidentsPanel
                incidents={incidents}
                schoolId={schoolId}
                studentId={filterStudentId}
                students={students}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

export default withI18n(HealthPage);

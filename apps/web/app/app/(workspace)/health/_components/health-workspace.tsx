'use client';

import {
  Activity,
  AlertTriangle,
  Pill,
  Stethoscope,
  Syringe,
  TrendingUp,
  Users,
} from 'lucide-react';
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
import type {
  HealthGrowthRecord,
  HealthIncident,
  HealthMedicalCheckup,
  HealthMedication,
  HealthVaccination,
  StudentHealthSummary,
  StudentOption,
} from '~/lib/kinder/health/types';

import { CheckupsPanel } from './checkups-panel';
import { GrowthPanel } from './growth-panel';
import { HealthDashboardPanel } from './health-dashboard-panel';
import { HealthProfilesPanel } from './health-profiles-panel';
import { IncidentsPanel } from './incidents-panel';
import { MedicationsPanel } from './medications-panel';
import { VaccinationsPanel } from './vaccinations-panel';

export function HealthWorkspace({
  schoolId,
  defaultTab,
  filterStudentId,
  students,
  summary,
  summaries,
  growth,
  vaccinations,
  checkups,
  medications,
  incidents,
}: {
  schoolId: string;
  defaultTab: string;
  filterStudentId?: string;
  students: StudentOption[];
  summary: Parameters<typeof HealthDashboardPanel>[0]['summary'];
  summaries: StudentHealthSummary[];
  growth: HealthGrowthRecord[];
  vaccinations: HealthVaccination[];
  checkups: HealthMedicalCheckup[];
  medications: HealthMedication[];
  incidents: HealthIncident[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathsConfig.app.health}?${params.toString()}`);
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:health.workspaceHint" />}
          title={<Trans i18nKey="kinder:health.workspaceTitle" />}
        />
      </div>

      <TabbedModule
        className="min-w-0 gap-0 p-4 sm:p-6"
        defaultValue={defaultTab}
        onValueChange={setTab}
        value={activeTab}
      >
        <TabbedModuleList className="mb-4 flex-wrap">
          <TabbedModuleTrigger value="dashboard">
            <Activity className="mr-2 size-4" />
            <Trans i18nKey="kinder:health.tabs.dashboard" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="profiles">
            <Users className="mr-2 size-4" />
            <Trans i18nKey="kinder:health.tabs.profiles" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="growth">
            <TrendingUp className="mr-2 size-4" />
            <Trans i18nKey="kinder:health.tabs.growth" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="vaccinations">
            <Syringe className="mr-2 size-4" />
            <Trans i18nKey="kinder:health.tabs.vaccinations" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="checkups">
            <Stethoscope className="mr-2 size-4" />
            <Trans i18nKey="kinder:health.tabs.checkups" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="medications">
            <Pill className="mr-2 size-4" />
            <Trans i18nKey="kinder:health.tabs.medications" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="incidents">
            <AlertTriangle className="mr-2 size-4" />
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
          <GrowthPanel
            records={growth}
            schoolId={schoolId}
            studentId={filterStudentId}
            students={students}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="vaccinations">
          <VaccinationsPanel
            schoolId={schoolId}
            studentId={filterStudentId}
            students={students}
            vaccinations={vaccinations}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="checkups">
          <CheckupsPanel
            checkups={checkups}
            schoolId={schoolId}
            studentId={filterStudentId}
            students={students}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="medications">
          <MedicationsPanel
            medications={medications}
            schoolId={schoolId}
            studentId={filterStudentId}
            students={students}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="incidents">
          <IncidentsPanel
            incidents={incidents}
            schoolId={schoolId}
            studentId={filterStudentId}
            students={students}
          />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}

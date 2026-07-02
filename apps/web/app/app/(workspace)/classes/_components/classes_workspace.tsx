'use client';

import { GraduationCap, Settings2 } from 'lucide-react';
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
  ClassGroup,
  Classroom,
  SchoolYear,
} from '~/lib/kinder/classes/types';

import { ClassesList } from './classes-list';
import { ClassesSetupPanel } from './classes-setup-panel';

export function ClassesWorkspace({
  classes,
  classrooms,
  schoolId,
  schoolYears,
  canManageClasses,
  defaultTab,
}: {
  classes: ClassGroup[];
  classrooms: Classroom[];
  schoolId: string;
  schoolYears: SchoolYear[];
  canManageClasses: boolean;
  defaultTab: 'classes' | 'setup';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;

  const safeTab =
    activeTab === 'setup' && !canManageClasses ? 'classes' : activeTab;
  const isSetupTab = safeTab === 'setup';

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathsConfig.app.classes}?${params.toString()}`);
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={
            isSetupTab ? (
              <Trans i18nKey="kinder:classes.setupHint" />
            ) : (
              <Trans i18nKey="kinder:classes.listDescription" />
            )
          }
          title={
            isSetupTab ? (
              <Trans i18nKey="kinder:classes.setup" />
            ) : (
              <Trans i18nKey="kinder:classes.title" />
            )
          }
        />
      </div>

      <TabbedModule
        className="min-w-0 gap-0 p-4 sm:p-6"
        defaultValue={defaultTab}
        onValueChange={setTab}
        value={safeTab}
      >
        <TabbedModuleList className="mb-4">
          <TabbedModuleTrigger value="classes">
            <GraduationCap className="mr-2 size-4" />
            <Trans i18nKey="common:routes.classes" />
          </TabbedModuleTrigger>
          {canManageClasses ? (
            <TabbedModuleTrigger value="setup">
              <Settings2 className="mr-2 size-4" />
              <Trans i18nKey="kinder:classes.setup" />
            </TabbedModuleTrigger>
          ) : null}
        </TabbedModuleList>

        <TabbedModuleContent value="classes">
          <ClassesList classes={classes} />
        </TabbedModuleContent>

        {canManageClasses ? (
          <TabbedModuleContent value="setup">
            <ClassesSetupPanel
              classrooms={classrooms}
              schoolId={schoolId}
              schoolYears={schoolYears}
            />
          </TabbedModuleContent>
        ) : null}
      </TabbedModule>
    </BentoTile>
  );
}

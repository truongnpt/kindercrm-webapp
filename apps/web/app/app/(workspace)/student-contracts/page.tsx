import { Suspense } from 'react';

import { redirect } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { loadActiveStudentsForFinance } from '~/lib/kinder/finance/load-finance';
import { loadActiveTuitionFeeItems } from '~/lib/kinder/finance/load-finance';
import {
  buildStudentsModulePermissions,
  hasPermission,
  loadMemberPermissions,
  STUDENTS_PERMISSIONS,
} from '~/lib/kinder/permissions';
import {
  loadStudentContracts,
  loadStudentContractsSummary,
} from '~/lib/kinder/student-contracts/load-student-contracts';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateStudentContractDialog } from './_components/create-student-contract-dialog';
import { StudentContractsExport } from './_components/student-contracts-export';
import { StudentContractsFilters } from './_components/student-contracts-filters';
import { StudentContractsList } from './_components/student-contracts-list';
import { StudentContractsOverview } from './_components/student-contracts-overview';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:studentContracts.title'),
  };
};

async function StudentContractsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    status?: string;
    studentId?: string;
    q?: string;
  }>;
}) {
  const { type, status, studentId, q } = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'students');

  const memberPermissions = await loadMemberPermissions(
    context.school.id,
    context.role,
    context.customRoleId,
  );

  if (!hasPermission(memberPermissions, STUDENTS_PERMISSIONS.CONTRACTS_VIEW)) {
    redirect(pathsConfig.app.home);
  }

  const permissions = buildStudentsModulePermissions(memberPermissions);

  const [summary, contracts, students, feeItems] = await Promise.all([
    loadStudentContractsSummary(context.school.id),
    loadStudentContracts(context.school.id, {
      type,
      status,
      studentId,
      query: q,
    }),
    loadActiveStudentsForFinance(context.school.id),
    loadActiveTuitionFeeItems(context.school.id),
  ]);

  return (
    <>
      <KinderPageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StudentContractsExport contracts={contracts} />
            {permissions.canManageContracts ? (
              <CreateStudentContractDialog
                feeItems={feeItems}
                schoolId={context.school.id}
                students={students}
              />
            ) : null}
          </div>
        }
        breadcrumbs={[
          {
            label: <Trans i18nKey="kinder:students.title" />,
            href: pathsConfig.app.students,
          },
          { label: <Trans i18nKey="kinder:studentContracts.title" /> },
        ]}
        description={<Trans i18nKey="kinder:studentContracts.description" />}
        title={<Trans i18nKey="kinder:studentContracts.title" />}
      />

      <KinderPageBody>
        <StudentContractsOverview summary={summary} />

        <div className="mb-4">
          <Suspense>
            <StudentContractsFilters />
          </Suspense>
        </div>

        <StudentContractsList
          canManage={permissions.canManageContracts}
          contracts={contracts}
          schoolId={context.school.id}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StudentContractsPage);

import { Suspense } from 'react';

import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  loadActiveClassesForFinance,
  loadActiveStudentsForFinance,
  loadActiveTuitionFeeItems,
  loadDebts,
  loadFeePlans,
  loadFinanceReportSummary,
  loadFinanceSummary,
  loadInvoices,
  loadPendingVerificationPayments,
  loadTuitionFeeItems,
} from '~/lib/kinder/finance/load-finance';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { BatchCreateInvoicesDialog } from './_components/batch-create-invoices-dialog';
import { CreateInvoiceDialog } from './_components/create-invoice-dialog';
import { FinanceOverview } from './_components/finance-overview';
import { FinanceWorkspace } from './_components/finance-workspace';
import { InvoiceStatusFilter } from './_components/invoice-status-filter';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:finance.title'),
  };
};

async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tab?: string }>;
}) {
  const { status, tab } = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'finance');
  await assertModuleAccessFromContext(context, pathsConfig.app.finance, 'view');

  const [
    summary,
    invoices,
    debts,
    feeItems,
    activeFeeItems,
    students,
    feePlans,
    pendingPayments,
    report,
    classes,
  ] = await Promise.all([
    loadFinanceSummary(context.school.id),
    loadInvoices(context.school.id, status),
    loadDebts(context.school.id),
    loadTuitionFeeItems(context.school.id),
    loadActiveTuitionFeeItems(context.school.id),
    loadActiveStudentsForFinance(context.school.id),
    loadFeePlans(context.school.id),
    loadPendingVerificationPayments(context.school.id),
    loadFinanceReportSummary(context.school.id),
    loadActiveClassesForFinance(context.school.id),
  ]);

  const defaultTab = tab ?? 'overview';

  return (
    <>
      <KinderPageHeader
        actions={
          <>
            <Suspense>
              <InvoiceStatusFilter />
            </Suspense>
            <BatchCreateInvoicesDialog
              classes={classes}
              feeItems={activeFeeItems}
              schoolId={context.school.id}
            />
            <CreateInvoiceDialog
              feeItems={activeFeeItems}
              schoolId={context.school.id}
              students={students}
            />
          </>
        }
        breadcrumbs={[{ label: <Trans i18nKey="kinder:finance.title" /> }]}
        description={<Trans i18nKey="kinder:finance.description" />}
        title={<Trans i18nKey="kinder:finance.title" />}
      />

      <KinderPageBody>
        <FinanceOverview summary={summary} />
        <FinanceWorkspace
          classes={classes}
          debts={debts}
          defaultTab={defaultTab}
          feeItems={feeItems}
          feePlans={feePlans}
          invoices={invoices}
          pendingPayments={pendingPayments}
          report={report}
          schoolId={context.school.id}
          students={students}
          summary={summary}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(FinancePage);

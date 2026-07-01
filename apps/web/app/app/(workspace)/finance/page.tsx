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
  loadActiveStudentsForFinance,
  loadActiveTuitionFeeItems,
  loadDebts,
  loadFinanceSummary,
  loadInvoices,
  loadTuitionFeeItems,
} from '~/lib/kinder/finance/load-finance';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateInvoiceDialog } from './_components/create-invoice-dialog';
import { DebtsList } from './_components/debts-list';
import { FinanceDashboard } from './_components/finance-dashboard';
import { InvoiceStatusFilter } from './_components/invoice-status-filter';
import { InvoicesList } from './_components/invoices-list';
import { TuitionFeesPanel } from './_components/tuition-fees-panel';

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

  const [
    summary,
    invoices,
    debts,
    feeItems,
    activeFeeItems,
    students,
  ] = await Promise.all([
    loadFinanceSummary(context.school.id),
    loadInvoices(context.school.id, status),
    loadDebts(context.school.id),
    loadTuitionFeeItems(context.school.id),
    loadActiveTuitionFeeItems(context.school.id),
    loadActiveStudentsForFinance(context.school.id),
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
            <CreateInvoiceDialog
              feeItems={activeFeeItems}
              schoolId={context.school.id}
              students={students}
            />
          </>
        }
        description={<Trans i18nKey="kinder:finance.description" />}
        title={<Trans i18nKey="kinder:finance.title" />}
      />

      <KinderPageBody>
        <TabbedModule defaultValue={defaultTab}>
          <TabbedModuleList>
            <TabbedModuleTrigger value="overview">
              <Trans i18nKey="kinder:finance.tabs.overview" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="invoices">
              <Trans i18nKey="kinder:finance.tabs.invoices" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="tuition">
              <Trans i18nKey="kinder:finance.tabs.tuition" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="debts">
              <Trans i18nKey="kinder:finance.tabs.debts" />
            </TabbedModuleTrigger>
          </TabbedModuleList>

          <TabbedModuleContent value="overview">
            <FinanceDashboard summary={summary} />
          </TabbedModuleContent>

          <TabbedModuleContent value="invoices">
            <InvoicesList invoices={invoices} />
          </TabbedModuleContent>

          <TabbedModuleContent value="tuition">
            <TuitionFeesPanel feeItems={feeItems} schoolId={context.school.id} />
          </TabbedModuleContent>

          <TabbedModuleContent value="debts">
            <DebtsList debts={debts} />
          </TabbedModuleContent>
        </TabbedModule>
      </KinderPageBody>
    </>
  );
}

export default withI18n(FinancePage);

import { notFound } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import {
  DetailPageHeader,
  KinderPageBody,
  StatusBadge,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { getVietQrConfig } from '~/lib/kinder/finance/vietqr';
import type { InvoiceWithStudent } from '~/lib/kinder/finance/types';
import {
  loadInvoiceAdjustments,
  loadInvoiceById,
  loadInvoiceLineItems,
  loadInvoicePayments,
  loadPaymentRefunds,
} from '~/lib/kinder/finance/load-finance';
import { loadStudentContractByInvoiceId } from '~/lib/kinder/student-contracts/load-student-contracts';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { InvoiceDetailWorkspace } from './_components/invoice-detail-workspace';
import { InvoiceExportActions } from './_components/invoice-export-actions';
import { InvoiceOverview } from './_components/invoice-overview';

const INVOICE_STATUS_TONE: Record<
  string,
  'default' | 'success' | 'muted' | 'warning' | 'danger'
> = {
  draft: 'muted',
  issued: 'default',
  partial: 'warning',
  paid: 'success',
  cancelled: 'danger',
  overdue: 'danger',
  waiting_verification: 'warning',
};

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:finance.invoices.detail'),
  };
};

async function InvoiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { invoiceId } = await params;
  const { tab } = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'finance');
  await assertModuleAccessFromContext(context, pathsConfig.app.finance, 'view');

  const invoice = await loadInvoiceById(context.school.id, invoiceId);

  if (!invoice) {
    notFound();
  }

  const [lineItems, adjustments, payments, linkedContract] = await Promise.all([
    loadInvoiceLineItems(context.school.id, invoiceId),
    loadInvoiceAdjustments(context.school.id, invoiceId),
    loadInvoicePayments(context.school.id, invoiceId),
    loadStudentContractByInvoiceId(context.school.id, invoiceId),
  ]);

  const refunds = await loadPaymentRefunds(
    context.school.id,
    payments.map((payment) => payment.id),
  );

  const balance = Math.max(0, invoice.total_amount - invoice.paid_amount);
  const invoiceWithPayment = invoice as InvoiceWithStudent & {
    transfer_content?: string | null;
    qr_code_url?: string | null;
  };
  const showQr =
    balance > 0 &&
    invoice.status !== 'cancelled' &&
    invoice.status !== 'paid' &&
    Boolean(invoiceWithPayment.qr_code_url || getVietQrConfig());

  const defaultTab = tab ?? (showQr ? 'qr' : 'overview');

  return (
    <>
      <DetailPageHeader
        actions={
          <InvoiceExportActions
            adjustments={adjustments}
            invoice={invoiceWithPayment}
            lineItems={lineItems}
            payments={payments}
            schoolName={context.school.name}
          />
        }
        backHref={pathsConfig.app.finance}
        breadcrumbs={[
          {
            label: <Trans i18nKey="kinder:finance.title" />,
            href: pathsConfig.app.finance,
          },
          { label: invoice.title },
        ]}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">{invoice.invoice_number}</span>
            <StatusBadge tone={INVOICE_STATUS_TONE[invoice.status] ?? 'default'}>
              <Trans
                i18nKey={`kinder:finance.invoices.statuses.${invoice.status}`}
              />
            </StatusBadge>
          </span>
        }
        title={invoice.title}
      />

      <KinderPageBody>
        <InvoiceOverview balance={balance} invoice={invoice} />
        <InvoiceDetailWorkspace
          adjustments={adjustments}
          balance={balance}
          defaultTab={defaultTab}
          invoice={invoice}
          lineItems={lineItems}
          linkedContract={linkedContract}
          payments={payments}
          refunds={refunds}
          schoolId={context.school.id}
          showQr={showQr}
          transferContent={invoiceWithPayment.transfer_content}
          vietQrConfig={getVietQrConfig()}
          vietQrUrl={invoiceWithPayment.qr_code_url}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(InvoiceDetailPage);

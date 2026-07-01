import { notFound } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import { getVietQrConfig } from '~/lib/kinder/finance/vietqr';
import {
  loadInvoiceAdjustments,
  loadInvoiceById,
  loadInvoiceLineItems,
  loadInvoicePayments,
  loadPaymentRefunds,
} from '~/lib/kinder/finance/load-finance';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { InvoiceDetailPanel } from './_components/invoice-detail-panel';
import { InvoiceVietQrPanel } from './_components/invoice-vietqr-panel';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:finance.invoices.detail'),
  };
};

async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'finance');

  const invoice = await loadInvoiceById(context.school.id, invoiceId);

  if (!invoice) {
    notFound();
  }

  const [lineItems, adjustments, payments] = await Promise.all([
    loadInvoiceLineItems(context.school.id, invoiceId),
    loadInvoiceAdjustments(context.school.id, invoiceId),
    loadInvoicePayments(context.school.id, invoiceId),
  ]);

  const refunds = await loadPaymentRefunds(
    context.school.id,
    payments.map((payment) => payment.id),
  );

  const balance = Math.max(0, invoice.total_amount - invoice.paid_amount);
  const vietQrConfig = getVietQrConfig();
  const showQr =
    vietQrConfig &&
    balance > 0 &&
    invoice.status !== 'cancelled' &&
    invoice.status !== 'paid';

  return (
    <>
      <PageHeader
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">{invoice.invoice_number}</span>
            <Badge>
              <Trans
                i18nKey={`kinder:finance.invoices.statuses.${invoice.status}`}
              />
            </Badge>
          </span>
        }
        title={invoice.title}
      />

      <PageBody className="space-y-4">
        {showQr && vietQrConfig ? (
          <InvoiceVietQrPanel
            amount={balance}
            config={vietQrConfig}
            invoiceNumber={invoice.invoice_number}
            studentName={invoice.student?.full_name ?? ''}
          />
        ) : null}
        <InvoiceDetailPanel
          adjustments={adjustments}
          invoice={invoice}
          lineItems={lineItems}
          payments={payments}
          refunds={refunds}
          schoolId={context.school.id}
        />
      </PageBody>
    </>
  );
}

export default withI18n(InvoiceDetailPage);

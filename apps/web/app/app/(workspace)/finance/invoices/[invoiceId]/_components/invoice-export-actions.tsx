'use client';

import { Download, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { exportInvoicePdf } from '~/lib/kinder/finance/export-invoice';
import { exportReceiptPdf } from '~/lib/kinder/finance/export-receipt';
import type {
  InvoiceAdjustment,
  InvoiceLineItem,
  InvoicePayment,
  InvoiceWithStudent,
} from '~/lib/kinder/finance/types';

export function InvoiceExportActions({
  invoice,
  lineItems,
  adjustments,
  payments,
  schoolName,
}: {
  invoice: InvoiceWithStudent & {
    transfer_content?: string | null;
    qr_code_url?: string | null;
    issue_date?: string;
  };
  lineItems: InvoiceLineItem[];
  adjustments: InvoiceAdjustment[];
  payments: InvoicePayment[];
  schoolName: string;
}) {
  const { t } = useTranslation('kinder');

  const verifiedPayments = payments.filter(
    (payment) =>
      !('status' in payment) ||
      payment.status === 'verified' ||
      payment.status === undefined,
  );

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          exportInvoicePdf(t, {
            invoiceNumber: invoice.invoice_number,
            title: invoice.title,
            billingPeriod: invoice.billing_period,
            issueDate: invoice.issue_date ?? invoice.created_at.slice(0, 10),
            dueDate: invoice.due_date,
            status: invoice.status,
            studentName: invoice.student.full_name,
            studentCode: invoice.student.student_code,
            className: invoice.student.class_name,
            schoolName,
            subtotal: invoice.subtotal,
            discountAmount: invoice.discount_amount,
            totalAmount: invoice.total_amount,
            paidAmount: invoice.paid_amount,
            transferContent: invoice.transfer_content,
            qrCodeUrl: invoice.qr_code_url,
            notes: invoice.notes,
            lineItems,
            adjustments,
          })
        }
        size="sm"
        type="button"
        variant="outline"
      >
        <FileText className="mr-2 size-4" />
        <Trans i18nKey="kinder:finance.invoices.downloadPdf" />
      </Button>

      {verifiedPayments.map((payment) => (
        <Button
          key={payment.id}
          onClick={() =>
            exportReceiptPdf(t, {
              receiptNumber: payment.receipt_number,
              invoiceNumber: invoice.invoice_number,
              studentName: invoice.student.full_name,
              studentCode: invoice.student.student_code,
              amount: payment.amount,
              paymentMethod: payment.payment_method,
              paidAt: payment.paid_at,
              schoolName,
            })
          }
          size="sm"
          type="button"
          variant="outline"
        >
          <Download className="mr-2 size-4" />
          {payment.receipt_number}
        </Button>
      ))}
    </div>
  );
}

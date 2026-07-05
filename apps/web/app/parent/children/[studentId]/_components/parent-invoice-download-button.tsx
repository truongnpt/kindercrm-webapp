'use client';

import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { exportInvoicePdf } from '~/lib/kinder/finance/export-invoice';

type InvoiceExportRow = {
  id: string;
  invoice_number: string;
  title: string;
  billing_period: string;
  due_date: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  subtotal?: number;
  discount_amount?: number;
  transfer_content?: string | null;
  qr_code_url?: string | null;
  notes?: string | null;
  issue_date?: string;
  created_at?: string;
};

export function ParentInvoiceDownloadButton({
  invoice,
  studentName,
  studentCode,
  schoolName,
}: {
  invoice: InvoiceExportRow;
  studentName: string;
  studentCode: string;
  schoolName: string;
}) {
  const { t } = useTranslation('kinder');

  return (
    <Button
      className="mt-2 w-full sm:w-auto"
      onClick={() =>
        exportInvoicePdf(t, {
          invoiceNumber: invoice.invoice_number,
          title: invoice.title ?? invoice.billing_period,
          billingPeriod: invoice.billing_period,
          issueDate:
            invoice.issue_date ??
            invoice.created_at?.slice(0, 10) ??
            invoice.due_date,
          dueDate: invoice.due_date,
          status: invoice.status,
          studentName,
          studentCode,
          className: null,
          schoolName,
          subtotal: invoice.subtotal ?? invoice.total_amount,
          discountAmount: invoice.discount_amount ?? 0,
          totalAmount: invoice.total_amount,
          paidAmount: invoice.paid_amount,
          transferContent: invoice.transfer_content,
          qrCodeUrl: invoice.qr_code_url,
          notes: invoice.notes,
          lineItems: [],
          adjustments: [],
        })
      }
      size="sm"
      type="button"
      variant="outline"
    >
      <FileText className="mr-2 size-4" />
      <Trans i18nKey="kinder:parent.finance.downloadInvoice" />
    </Button>
  );
}

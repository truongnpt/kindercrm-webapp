import type { TFunction } from 'i18next';

import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { applyUnicodePdfFont, downloadPdfBlob } from '~/lib/kinder/export/pdf';

export type ReceiptExportRow = {
  receiptNumber: string;
  invoiceNumber: string;
  studentName: string;
  studentCode: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  schoolName: string;
};

export function buildReceiptExportFilename(receiptNumber: string) {
  const slug = receiptNumber.replace(/[^a-zA-Z0-9-]+/g, '-').toLowerCase();

  return `receipt-${slug}.pdf`;
}

export async function exportReceiptPdf(
  t: TFunction,
  row: ReceiptExportRow,
) {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
  await applyUnicodePdfFont(doc);

  let y = 16;

  doc.setFontSize(14);
  doc.text(row.schoolName, 14, y);
  y += 8;

  doc.setFontSize(11);
  doc.text(t('finance.receipt.title'), 14, y);
  y += 8;

  doc.setFontSize(9);
  const lines = [
    `${t('finance.receipt.number')}: ${row.receiptNumber}`,
    `${t('finance.invoices.number')}: ${row.invoiceNumber}`,
    `${t('finance.invoices.student')}: ${row.studentName} (${row.studentCode})`,
    `${t('finance.payments.amount')}: ${formatVnd(row.amount)}`,
    `${t('finance.payments.method')}: ${t(`finance.payments.methods.${row.paymentMethod}`)}`,
    `${t('finance.receipt.paidAt')}: ${new Date(row.paidAt).toLocaleString()}`,
  ];

  for (const line of lines) {
    doc.text(line, 14, y);
    y += 6;
  }

  downloadPdfBlob(
    buildReceiptExportFilename(row.receiptNumber),
    doc.output('blob'),
  );
}

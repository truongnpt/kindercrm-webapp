import type { TFunction } from 'i18next';

import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { applyUnicodePdfFont, downloadPdfBlob } from '~/lib/kinder/export/pdf';

import type { InvoiceAdjustment, InvoiceLineItem } from './types';

export type InvoiceExportData = {
  invoiceNumber: string;
  title: string;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  status: string;
  studentName: string;
  studentCode: string;
  className: string | null;
  schoolName: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  transferContent?: string | null;
  qrCodeUrl?: string | null;
  notes?: string | null;
  lineItems: InvoiceLineItem[];
  adjustments: InvoiceAdjustment[];
};

export function buildInvoiceExportFilename(invoiceNumber: string) {
  const slug = invoiceNumber.replace(/[^a-zA-Z0-9-]+/g, '-').toLowerCase();

  return `invoice-${slug}.pdf`;
}

export async function exportInvoicePdf(t: TFunction, data: InvoiceExportData) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  await applyUnicodePdfFont(doc);

  const margin = 14;
  let y = margin;

  doc.setFontSize(16);
  doc.text(data.schoolName, margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.text(t('finance.invoices.detail'), margin, y);
  y += 7;

  doc.setFontSize(9);
  const meta = [
    `${t('finance.invoices.number')}: ${data.invoiceNumber}`,
    `${t('finance.invoices.title')}: ${data.title}`,
    `${t('finance.invoices.student')}: ${data.studentName} (${data.studentCode})`,
    data.className ? `${t('finance.reports.class')}: ${data.className}` : '',
    `${t('finance.invoices.period')}: ${data.billingPeriod}`,
    `${t('finance.invoices.dueDate')}: ${data.dueDate}`,
    `${t('finance.invoices.status')}: ${t(`finance.invoices.statuses.${data.status}`)}`,
  ].filter(Boolean);

  for (const line of meta) {
    doc.text(line, margin, y);
    y += 5;
  }

  if (data.transferContent) {
    y += 2;
    doc.text(
      `${t('finance.qr.transferContent')}: ${data.transferContent}`,
      margin,
      y,
    );
    y += 5;
  }

  autoTable(doc, {
    startY: y + 4,
    head: [[
      t('finance.invoices.lineItems'),
      t('finance.invoices.quantity'),
      t('finance.tuition.amount'),
      t('finance.invoices.total'),
    ]],
    body: data.lineItems.map((item) => [
      item.description,
      String(item.quantity),
      formatVnd(item.unit_amount),
      formatVnd(item.line_total),
    ]),
    styles: { font: 'NotoSans', fontSize: 9, cellPadding: 2 },
    headStyles: {
      font: 'NotoSans',
      fontStyle: 'normal',
      fillColor: [30, 64, 175],
      textColor: 255,
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? y + 40;
  y += 10;

  const totals = [
    [t('finance.invoices.total'), formatVnd(data.subtotal)],
    [t('finance.adjustments.title'), formatVnd(data.discountAmount)],
    [t('finance.invoices.total'), formatVnd(data.totalAmount)],
    [t('finance.invoices.paid'), formatVnd(data.paidAmount)],
    [
      t('finance.debts.balance'),
      formatVnd(Math.max(0, data.totalAmount - data.paidAmount)),
    ],
  ];

  autoTable(doc, {
    startY: y,
    body: totals,
    theme: 'plain',
    styles: { font: 'NotoSans', fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  if (data.notes) {
    y =
      (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? y;
    y += 8;
    doc.setFontSize(9);
    doc.text(`${t('finance.invoices.notes')}: ${data.notes}`, margin, y);
  }

  if (data.qrCodeUrl) {
    try {
      const response = await fetch(data.qrCodeUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      doc.addPage();
      doc.setFontSize(12);
      doc.text(t('finance.qr.title'), margin, margin);
      doc.addImage(base64, 'PNG', margin, margin + 8, 60, 60);
    } catch {
      // QR embed is optional; invoice PDF still exports without it.
    }
  }

  downloadPdfBlob(
    buildInvoiceExportFilename(data.invoiceNumber),
    doc.output('blob'),
  );
}

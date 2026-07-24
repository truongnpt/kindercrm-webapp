import 'server-only';

import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { applyUnicodePdfFont } from '~/lib/kinder/export/pdf';

import { getSaasInvoiceSeller } from './saas-invoice-config';
import { formatDate } from '@/lib/utils/date';
import appConfig from '@/config/app.config';

export type SaasInvoicePdfData = {
  invoiceNumber: string;
  issuedAt: string;
  schoolName: string;
  buyerEmail: string | null;
  packageName: string;
  billingPeriodStart: string | null;
  billingPeriodEnd: string | null;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
};

function formatPeriodLabel(start: string | null, end: string | null) {
  if (!start && !end) {
    return '—';
  }

  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function buildSaasInvoicePdfFilename(invoiceNumber: string) {
  const slug = invoiceNumber.replace(/[^a-zA-Z0-9-]+/g, '-').toLowerCase();

  return `hoa-don-saas-${slug}.pdf`;
}

export async function generateSaasInvoicePdfBuffer(data: SaasInvoicePdfData) {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const autoTable = autoTableModule.default;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  await applyUnicodePdfFont(doc);

  const seller = getSaasInvoiceSeller();
  const margin = 14;
  let y = margin;

  doc.setFontSize(16);
  doc.text('HÓA ĐƠN GIÁ TRỊ GIA TĂNG', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.text(`(Phí phần mềm ${appConfig.name} — SaaS)`, margin, y);
  y += 10;

  doc.setFontSize(11);
  doc.text(`Số hóa đơn: ${data.invoiceNumber}`, margin, y);
  y += 6;
  doc.text(`Ngày phát hành: ${formatDate(data.issuedAt)}`, margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.text('Đơn vị bán:', margin, y);
  y += 5;
  doc.text(seller.name, margin + 4, y);
  y += 5;

  if (seller.taxCode) {
    doc.text(`MST: ${seller.taxCode}`, margin + 4, y);
    y += 5;
  }

  if (seller.address) {
    const addressLines = doc.splitTextToSize(seller.address, 180);
    doc.text(addressLines, margin + 4, y);
    y += addressLines.length * 5;
  }

  y += 4;
  doc.text('Khách hàng:', margin, y);
  y += 5;
  doc.text(data.schoolName, margin + 4, y);
  y += 5;

  if (data.buyerEmail) {
    doc.text(`Email: ${data.buyerEmail}`, margin + 4, y);
    y += 5;
  }

  y += 4;
  doc.text(`Kỳ thanh toán: ${formatPeriodLabel(data.billingPeriodStart, data.billingPeriodEnd)}`, margin, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [['Mô tả', 'Đơn giá', 'Thuế GTGT', 'Thành tiền']],
    body: [[
      `Gói đăng ký ${data.packageName}`,
      formatVnd(data.subtotal),
      `${data.vatRate}% (${formatVnd(data.vatAmount)})`,
      formatVnd(data.totalAmount),
    ]],
    styles: { font: 'NotoSans', fontSize: 9, cellPadding: 2 },
    headStyles: {
      font: 'NotoSans',
      fontStyle: 'normal',
      fillColor: [3, 76, 248],
      textColor: 255,
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? y + 40;
  y += 8;

  const totals = [
    ['Tạm tính (chưa thuế)', formatVnd(data.subtotal)],
    [`Thuế GTGT (${data.vatRate}%)`, formatVnd(data.vatAmount)],
    ['Tổng thanh toán', formatVnd(data.totalAmount)],
  ];

  autoTable(doc, {
    startY: y,
    body: totals,
    theme: 'plain',
    styles: { font: 'NotoSans', fontSize: 10, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
    ?.finalY ?? y + 20;
  y += 10;

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `Hóa đơn điện tử cho phí sử dụng phần mềm ${appConfig.name}. Không phải hóa đơn học phí học sinh.`,
    margin,
    y,
    { maxWidth: 180 },
  );

  const arrayBuffer = doc.output('arraybuffer');

  return Buffer.from(arrayBuffer);
}

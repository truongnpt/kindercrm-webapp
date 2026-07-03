import type { TFunction } from 'i18next';

import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { buildCsv, downloadCsv } from '~/lib/kinder/export/csv';
import { applyUnicodePdfFont, downloadPdfBlob } from '~/lib/kinder/export/pdf';

export type ContractCsvRow = {
  contract_number: string;
  title: string;
  contract_type: string;
  status: string;
  start_date: string;
  end_date: string | null;
  total_amount: number;
  billing_period: string | null;
  signed_at: string | null;
  terms: string | null;
  invoice_number?: string | null;
  student_code?: string;
  student_name?: string;
  class_name?: string | null;
};

function slugifyFilenamePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function buildStudentContractsExportFilename(
  extension: 'csv' | 'pdf',
  options?: {
    studentCode?: string;
    scope?: 'staff' | 'parent';
  },
) {
  const date = new Date().toISOString().slice(0, 10);
  const prefix =
    options?.scope === 'parent' ? 'parent-contracts' : 'student-contracts';

  if (options?.studentCode) {
    const slug = slugifyFilenamePart(options.studentCode) || 'student';

    return `${prefix}-${slug}-${date}.${extension}`;
  }

  return `${prefix}-${date}.${extension}`;
}

function getExportHeaders(t: TFunction, includeStudentColumns: boolean) {
  const headers = [
    t('studentContracts.exportColumns.number'),
    t('studentContracts.exportColumns.title'),
    t('studentContracts.exportColumns.type'),
    t('studentContracts.exportColumns.status'),
  ];

  if (includeStudentColumns) {
    headers.push(
      t('studentContracts.exportColumns.studentCode'),
      t('studentContracts.exportColumns.studentName'),
      t('studentContracts.exportColumns.className'),
    );
  }

  headers.push(
    t('studentContracts.exportColumns.startDate'),
    t('studentContracts.exportColumns.endDate'),
    t('studentContracts.exportColumns.amount'),
    t('studentContracts.exportColumns.billingPeriod'),
    t('studentContracts.exportColumns.invoiceNumber'),
    t('studentContracts.exportColumns.signedAt'),
    t('studentContracts.exportColumns.terms'),
  );

  return headers;
}

function mapContractToExportRow(
  contract: ContractCsvRow,
  t: TFunction,
  includeStudentColumns: boolean,
): string[] {
  const base = [
    contract.contract_number,
    contract.title,
    t(`studentContracts.types.${contract.contract_type}`),
    t(`studentContracts.statuses.${contract.status}`),
  ];

  if (includeStudentColumns) {
    base.push(
      contract.student_code ?? '',
      contract.student_name ?? '',
      contract.class_name ?? '',
    );
  }

  base.push(
    contract.start_date,
    contract.end_date ?? '',
    formatVnd(contract.total_amount),
    contract.billing_period ?? '',
    contract.invoice_number ?? '',
    contract.signed_at ?? '',
    contract.terms ?? '',
  );

  return base;
}

export function buildStudentContractsTableData(
  contracts: ContractCsvRow[],
  t: TFunction,
  options?: { includeStudentColumns?: boolean },
) {
  const includeStudentColumns = options?.includeStudentColumns ?? true;
  const headers = getExportHeaders(t, includeStudentColumns);
  const rows = contracts.map((contract) =>
    mapContractToExportRow(contract, t, includeStudentColumns),
  );

  return { headers, rows };
}

export function buildStudentContractsCsv(
  contracts: ContractCsvRow[],
  t: TFunction,
  options?: { includeStudentColumns?: boolean },
) {
  const { headers, rows } = buildStudentContractsTableData(contracts, t, options);

  return buildCsv(headers, rows);
}

export function downloadStudentContractsCsv(
  contracts: ContractCsvRow[],
  t: TFunction,
  options?: {
    includeStudentColumns?: boolean;
    studentCode?: string;
    scope?: 'staff' | 'parent';
  },
) {
  if (contracts.length === 0) {
    return false;
  }

  const csv = buildStudentContractsCsv(contracts, t, options);
  const filename = buildStudentContractsExportFilename('csv', {
    studentCode: options?.studentCode,
    scope: options?.scope,
  });

  downloadCsv(filename, csv);

  return true;
}

export async function downloadStudentContractsPdf(
  contracts: ContractCsvRow[],
  t: TFunction,
  options?: {
    includeStudentColumns?: boolean;
    studentCode?: string;
    scope?: 'staff' | 'parent';
    studentName?: string;
  },
) {
  if (contracts.length === 0) {
    return false;
  }

  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const autoTable = autoTableModule.default;
  const includeStudentColumns = options?.includeStudentColumns ?? true;
  const { headers, rows } = buildStudentContractsTableData(
    contracts,
    t,
    options,
  );
  const exportedAt = new Date().toLocaleString('vi-VN');
  const doc = new jsPDF({
    orientation: includeStudentColumns ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  await applyUnicodePdfFont(doc);

  const margin = 14;
  let cursorY = margin;

  doc.setFontSize(16);
  doc.text(t('studentContracts.exportPdfTitle'), margin, cursorY);
  cursorY += 8;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    t('studentContracts.exportedAt', { date: exportedAt }),
    margin,
    cursorY,
  );
  cursorY += 5;

  if (options?.studentName) {
    doc.text(
      t('studentContracts.exportStudent', { name: options.studentName }),
      margin,
      cursorY,
    );
    cursorY += 5;
  }

  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: cursorY + 4,
    head: [headers],
    body: rows,
    styles: {
      font: 'NotoSans',
      fontSize: includeStudentColumns ? 7 : 8,
      cellPadding: 2,
      overflow: 'linebreak',
    },
    headStyles: {
      font: 'NotoSans',
      fontStyle: 'normal',
      fillColor: [30, 64, 175],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: margin, right: margin },
  });

  const filename = buildStudentContractsExportFilename('pdf', {
    studentCode: options?.studentCode,
    scope: options?.scope,
  });

  downloadPdfBlob(filename, doc.output('blob'));

  return true;
}

'use client';

import { useState } from 'react';

import { ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import {
  type ContractCsvRow,
  downloadStudentContractsCsv,
  downloadStudentContractsPdf,
} from '~/lib/kinder/student-contracts/export-contracts';
import type { StudentContractWithInvoice } from '~/lib/kinder/student-contracts/types';

function toStaffExportRows(
  contracts: StudentContractWithInvoice[],
): ContractCsvRow[] {
  return contracts.map((contract) => ({
    contract_number: contract.contract_number,
    title: contract.title,
    contract_type: contract.contract_type,
    status: contract.status,
    start_date: contract.start_date,
    end_date: contract.end_date,
    total_amount: contract.total_amount,
    billing_period: contract.billing_period,
    signed_at: contract.signed_at,
    terms: contract.terms,
    invoice_number: contract.invoice?.invoice_number ?? null,
    student_code: contract.student.student_code,
    student_name: contract.student.full_name,
    class_name: contract.student.class_name,
  }));
}

export function StudentContractsExportMenu({
  contracts,
  className,
  includeStudentColumns = true,
  scope = 'staff',
  studentCode,
  studentName,
  variant = 'outline',
  size = 'sm',
}: {
  contracts: StudentContractWithInvoice[] | ContractCsvRow[];
  className?: string;
  includeStudentColumns?: boolean;
  scope?: 'staff' | 'parent';
  studentCode?: string;
  studentName?: string;
  variant?: 'outline' | 'ghost' | 'default' | 'secondary';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}) {
  const { t } = useTranslation('kinder');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const rows: ContractCsvRow[] =
    contracts.length > 0 && 'student' in contracts[0]!
      ? toStaffExportRows(contracts as StudentContractWithInvoice[])
      : (contracts as ContractCsvRow[]);

  const exportOptions = {
    includeStudentColumns,
    studentCode,
    studentName,
    scope,
  };

  const handleCsvExport = () => {
    const success = downloadStudentContractsCsv(rows, t, exportOptions);

    if (!success) {
      toast.error(t('studentContracts.exportEmpty'));
    }
  };

  const handlePdfExport = async () => {
    if (rows.length === 0) {
      toast.error(t('studentContracts.exportEmpty'));
      return;
    }

    setIsExportingPdf(true);

    try {
      const success = await downloadStudentContractsPdf(rows, t, exportOptions);

      if (!success) {
        toast.error(t('studentContracts.exportEmpty'));
      }
    } catch {
      toast.error(t('studentContracts.exportPdfError'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(className)}
          disabled={rows.length === 0 || isExportingPdf}
          type="button"
          variant={variant}
        >
          <Download className="mr-1.5 size-4" />
          <Trans i18nKey="kinder:studentContracts.exportMenu.trigger" />
          <ChevronDown className="ml-1.5 size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={handleCsvExport}>
          <FileSpreadsheet className="mr-2 size-4" />
          <Trans i18nKey="kinder:studentContracts.exportMenu.csv" />
        </DropdownMenuItem>
        <DropdownMenuItem disabled={isExportingPdf} onSelect={handlePdfExport}>
          <FileText className="mr-2 size-4" />
          <Trans i18nKey="kinder:studentContracts.exportMenu.pdf" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

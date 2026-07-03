'use client';

import { StudentContractsExportMenu } from '~/components/student-contracts/student-contracts-export-menu';
import type { ContractCsvRow } from '~/lib/kinder/student-contracts/export-contracts';

type ParentContractRow = {
  contract_number: string;
  contract_type: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string | null;
  total_amount: number;
  billing_period: string | null;
  signed_at: string | null;
  terms: string | null;
  invoice: {
    invoice_number: string;
  } | null;
};

export function ParentContractsExportButton({
  contracts,
  studentCode,
  studentName,
}: {
  contracts: ParentContractRow[];
  studentCode: string;
  studentName: string;
}) {
  const rows: ContractCsvRow[] = contracts.map((contract) => ({
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
  }));

  return (
    <StudentContractsExportMenu
      className="min-h-11"
      contracts={rows}
      includeStudentColumns={false}
      scope="parent"
      studentCode={studentCode}
      studentName={studentName}
    />
  );
}

'use client';

import { StudentContractsExportMenu } from '~/components/student-contracts/student-contracts-export-menu';
import type { StudentContractWithInvoice } from '~/lib/kinder/student-contracts/types';

export function StudentContractsExport({
  contracts,
}: {
  contracts: StudentContractWithInvoice[];
}) {
  return <StudentContractsExportMenu contracts={contracts} />;
}

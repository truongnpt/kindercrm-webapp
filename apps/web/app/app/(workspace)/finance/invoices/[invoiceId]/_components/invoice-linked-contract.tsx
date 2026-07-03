import Link from 'next/link';

import { ExternalLink, FileSignature } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import type { StudentContractWithInvoice } from '~/lib/kinder/student-contracts/types';

import { StudentContractStatusBadge } from '../../../../student-contracts/_components/student-contract-status-badge';

export function InvoiceLinkedContract({
  contract,
}: {
  contract: StudentContractWithInvoice;
}) {
  return (
    <div className="mb-4 rounded-2xl border border-border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <FileSignature className="text-primary size-4 shrink-0" />
            <p className="font-medium">
              <Trans i18nKey="kinder:studentContracts.linkedContract" />
            </p>
            <StudentContractStatusBadge status={contract.status} />
          </div>
          <p className="mt-2 font-semibold">{contract.title}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {contract.contract_number} ·{' '}
            <Trans
              i18nKey={`kinder:studentContracts.types.${contract.contract_type}`}
            />
          </p>
        </div>

        <Button asChild size="sm" variant="outline">
          <Link href={`${pathsConfig.app.studentContracts}?q=${contract.contract_number}`}>
            <Trans i18nKey="kinder:studentContracts.viewContract" />
            <ExternalLink className="ml-1.5 size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

'use client';

import { AlertTriangle, FileSignature } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { ParentEmptyState, ParentSectionHeader } from '~/components/parent-portal';
import { formatVnd } from '~/lib/kinder/billing/format-currency';

import { ParentContractsExportButton } from './parent-contracts-export-button';

type ParentContractRow = {
  id: string;
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
    id: string;
    invoice_number: string;
    status: string;
    total_amount: number;
    paid_amount: number;
    due_date: string;
  } | null;
};

const STATUS_TONE: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-700',
  expired: 'bg-amber-500/10 text-amber-700',
  terminated: 'bg-muted text-muted-foreground',
};

function isExpiringSoon(endDate: string | null, status: string) {
  if (status !== 'active' || !endDate) {
    return false;
  }

  const end = new Date(`${endDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soon = new Date(today);
  soon.setDate(soon.getDate() + 30);

  return end >= today && end <= soon;
}

export function ParentContractsPanel({
  contracts,
  studentCode,
  studentName,
  onOpenFinanceTab,
}: {
  contracts: ParentContractRow[];
  studentCode: string;
  studentName: string;
  onOpenFinanceTab?: () => void;
}) {
  const expiringContracts = contracts.filter((contract) =>
    isExpiringSoon(contract.end_date, contract.status),
  );

  if (contracts.length === 0) {
    return (
      <ParentEmptyState
        descriptionKey="kinder:parent.contracts.emptyDescription"
        icon={FileSignature}
        titleKey="kinder:parent.contracts.empty"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ParentSectionHeader
        action={
          <ParentContractsExportButton
            contracts={contracts}
            studentCode={studentCode}
            studentName={studentName}
          />
        }
        description={<Trans i18nKey="kinder:parent.contracts.hint" />}
        title={<Trans i18nKey="kinder:parent.tabs.contracts" />}
      />

      {expiringContracts.length > 0 ? (
        <div className="flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <div className="min-w-0 text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-200">
              <Trans i18nKey="kinder:parent.contracts.expiringTitle" />
            </p>
            <p className="mt-1 text-amber-800/90 dark:text-amber-100/80">
              <Trans
                i18nKey="kinder:parent.contracts.expiringDescription"
                values={{ count: expiringContracts.length }}
              />
            </p>
          </div>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {contracts.map((contract) => (
          <li
            className="rounded-2xl border border-border bg-muted/30 p-4"
            key={contract.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">
                  {contract.contract_number}
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {contract.title}
                </p>
              </div>
              <Badge
                className={cn(
                  'rounded-full border-0',
                  STATUS_TONE[contract.status] ?? STATUS_TONE.terminated,
                )}
              >
                <Trans
                  i18nKey={`kinder:studentContracts.statuses.${contract.status}`}
                />
              </Badge>
            </div>

            <p className="text-muted-foreground mt-2 text-sm">
              <Trans
                i18nKey={`kinder:studentContracts.types.${contract.contract_type}`}
              />
            </p>

            <p className="text-muted-foreground mt-1 text-sm">
              {contract.start_date}
              {contract.end_date ? ` → ${contract.end_date}` : ''}
            </p>

            {contract.signed_at ? (
              <p className="text-muted-foreground mt-1 text-sm">
                <Trans i18nKey="kinder:parent.contracts.signedAt" />:{' '}
                {contract.signed_at}
              </p>
            ) : null}

            {contract.total_amount > 0 ? (
              <p className="mt-3 text-base font-bold text-foreground">
                {formatVnd(contract.total_amount)}
              </p>
            ) : null}

            {contract.terms ? (
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {contract.terms}
              </p>
            ) : null}

            {isExpiringSoon(contract.end_date, contract.status) ? (
              <p className="mt-3 text-sm font-medium text-amber-700">
                <Trans
                  i18nKey="kinder:parent.contracts.expiresOn"
                  values={{ date: contract.end_date }}
                />
              </p>
            ) : null}

            {contract.invoice ? (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <Trans i18nKey="kinder:parent.contracts.linkedInvoice" />
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {contract.invoice.invoice_number}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  <Trans i18nKey="kinder:parent.finance.dueDate" />:{' '}
                  {contract.invoice.due_date}
                  {' · '}
                  {formatVnd(contract.invoice.total_amount)}
                </p>
                {onOpenFinanceTab ? (
                  <button
                    className="text-primary mt-2 text-sm font-medium hover:underline"
                    onClick={onOpenFinanceTab}
                    type="button"
                  >
                    <Trans i18nKey="kinder:parent.contracts.viewTuition" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

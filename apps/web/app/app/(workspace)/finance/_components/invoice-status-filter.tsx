'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';

const STATUSES = [
  'all',
  'issued',
  'partial',
  'paid',
  'overdue',
  'cancelled',
] as const;

export function InvoiceStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? 'all';

  return (
    <Select
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === 'all') {
          params.delete('status');
        } else {
          params.set('status', value);
        }

        const query = params.toString();
        router.push(
          query ? `${pathsConfig.app.finance}?${query}` : pathsConfig.app.finance,
        );
      }}
      value={status}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((item) => (
          <SelectItem key={item} value={item}>
            <Trans i18nKey={`kinder:finance.invoices.statuses.${item}`} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

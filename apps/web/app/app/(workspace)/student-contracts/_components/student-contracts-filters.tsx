'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useTranslation } from 'react-i18next';

import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import {
  STUDENT_CONTRACT_STATUSES,
  STUDENT_CONTRACT_TYPES,
} from '~/lib/kinder/student-contracts/schemas/student-contract.schema';

export function StudentContractsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('kinder');
  const currentType = searchParams.get('type') ?? 'all';
  const currentStatus = searchParams.get('status') ?? 'all';
  const currentQuery = searchParams.get('q') ?? '';

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const query = params.toString();
    router.push(
      query
        ? `${pathsConfig.app.studentContracts}?${query}`
        : pathsConfig.app.studentContracts,
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Input
        className="h-11 w-full sm:max-w-xs"
        onChange={(event) => {
          updateParams({ q: event.target.value || null });
        }}
        placeholder={t('studentContracts.searchPlaceholder')}
        value={currentQuery}
      />

      <Select
        onValueChange={(value) => updateParams({ type: value })}
        value={currentType}
      >
        <SelectTrigger className="h-11 w-full sm:w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <Trans i18nKey="kinder:studentContracts.filterAllTypes" />
          </SelectItem>
          {STUDENT_CONTRACT_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              <Trans i18nKey={`kinder:studentContracts.types.${type}`} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => updateParams({ status: value })}
        value={currentStatus}
      >
        <SelectTrigger className="h-11 w-full sm:w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <Trans i18nKey="kinder:studentContracts.filterAllStatuses" />
          </SelectItem>
          {STUDENT_CONTRACT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              <Trans i18nKey={`kinder:studentContracts.statuses.${status}`} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

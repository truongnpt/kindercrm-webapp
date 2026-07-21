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

  const currentSearch = searchParams.get('search') ?? '';
  const currentType = searchParams.get('type') ?? 'all';
  const currentStatus = searchParams.get('status') ?? 'all';

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Filter/Search => quay về trang đầu
    params.delete('page');

    const nextUrl = params.toString()
      ? `${pathsConfig.app.studentContracts}?${params.toString()}`
      : pathsConfig.app.studentContracts;

    if (nextUrl !== window.location.pathname + window.location.search) {
      router.push(nextUrl);
    }
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      <Select
        value={currentType}
        onValueChange={(value) =>
          updateParams({
            type: value,
          })
        }
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
              <Trans
                i18nKey={`kinder:studentContracts.types.${type}`}
              />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentStatus}
        onValueChange={(value) =>
          updateParams({
            status: value,
          })
        }
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
              <Trans
                i18nKey={`kinder:studentContracts.statuses.${status}`}
              />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
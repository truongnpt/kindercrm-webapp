'use client';

import { ChevronDown, Download } from 'lucide-react';
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

import { buildCsv, downloadCsv } from '~/lib/kinder/export/csv';
import {
  buildHealthExportCsv,
  healthExportFilename,
  type HealthExportKind,
} from '~/lib/kinder/health/build-health-export';
import type { HealthExportBundle } from '~/lib/kinder/health/load-health-export';

const EXPORT_KINDS: HealthExportKind[] = [
  'profiles',
  'growth',
  'vaccinations',
  'checkups',
  'medications',
  'incidents',
];

export function HealthExport({ bundle }: { bundle: HealthExportBundle }) {
  const { t } = useTranslation('kinder');

  const handleExport = (kind: HealthExportKind) => {
    const { headers, rows } = buildHealthExportCsv(kind, bundle);

    if (rows.length === 0) {
      toast.error(t('health.exportEmpty'));
      return;
    }

    const csv = buildCsv(headers, rows);
    downloadCsv(healthExportFilename(kind), csv);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <Download className="mr-2 size-4" />
          <Trans i18nKey="kinder:importExport.export" />
          <ChevronDown className="ml-2 size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {EXPORT_KINDS.map((kind) => (
          <DropdownMenuItem key={kind} onSelect={() => handleExport(kind)}>
            <Trans i18nKey={`kinder:health.exportKinds.${kind}`} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

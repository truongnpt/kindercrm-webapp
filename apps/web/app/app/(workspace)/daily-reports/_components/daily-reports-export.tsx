'use client';

import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { buildCsv, downloadCsv } from '~/lib/kinder/export/csv';
import type { DailyReportExportRow } from '~/lib/kinder/daily-reports/load-daily-reports';

const EXPORT_HEADERS = [
  'Date',
  'Class',
  'Class code',
  'Student code',
  'Student name',
  'Status',
  'Mood',
  'Summary',
  'Meals',
  'Nap',
  'Activities',
  'Teacher note',
  'Published at',
  'Parent acknowledged',
];

export function DailyReportsExport({
  rows,
  reportDate,
}: {
  rows: DailyReportExportRow[];
  reportDate: string;
}) {
  const { t } = useTranslation('kinder');

  const handleExport = () => {
    if (rows.length === 0) {
      toast.error(t('dailyReports.exportEmpty'));
      return;
    }

    const csv = buildCsv(
      EXPORT_HEADERS,
      rows.map((row) => [
        row.reportDate,
        row.className,
        row.classCode,
        row.studentCode,
        row.studentName,
        row.status,
        row.mood,
        row.dailySummary,
        row.meals,
        row.nap,
        row.activities,
        row.teacherNote,
        row.publishedAt,
        row.parentAcknowledged,
      ]),
    );

    downloadCsv(`daily-reports-${reportDate}.csv`, csv);
  };

  return (
    <Button onClick={handleExport} size="sm" type="button" variant="outline">
      <Download className="mr-2 size-4" />
      <Trans i18nKey="kinder:importExport.export" />
    </Button>
  );
}

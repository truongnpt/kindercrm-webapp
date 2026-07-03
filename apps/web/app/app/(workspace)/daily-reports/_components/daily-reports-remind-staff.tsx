'use client';

import { BellRing } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { kinderQueryKeys, useKinderMutation } from '~/components/kinder-ui';
import { remindDailyReportsStaffAction } from '~/lib/kinder/daily-reports/server-actions';
import type { DailyReportsClassSummary } from '~/lib/kinder/daily-reports/types';

export function DailyReportsRemindStaff({
  schoolId,
  reportDate,
  summaries,
}: {
  schoolId: string;
  reportDate: string;
  summaries: DailyReportsClassSummary[];
}) {
  const { t } = useTranslation('kinder');
  const hasIncomplete = summaries.some(
    (summary) => summary.missingCount > 0 || summary.draftCount > 0,
  );

  const remindStaff = useKinderMutation({
    mutationFn: remindDailyReportsStaffAction,
    invalidateKeys: [kinderQueryKeys.school(schoolId)],
    onSuccess: (result) => {
      const notified =
        result && typeof result === 'object' && 'notified' in result
          ? Number(result.notified)
          : 0;

      if (notified === 0) {
        toast.message(t('dailyReports.remindStaffAllComplete'));
        return;
      }

      toast.success(
        t('dailyReports.remindStaffSuccess', { count: notified }),
      );
    },
  });

  if (!hasIncomplete) {
    return null;
  }

  return (
    <Button
 disabled={remindStaff.isPending}
 onClick={() =>
        remindStaff.mutate({
          schoolId,
          reportDate,
        })
      }
      size="sm"
      type="button"
      variant="secondary"
    >
      <BellRing className="mr-2 size-4" />
      <Trans i18nKey="kinder:dailyReports.remindStaff" />
    </Button>
  );
}

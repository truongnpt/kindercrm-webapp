'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { AlertTriangle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { PlatformSectionCard } from '~/components/platform-console';
import { platformRepairSchoolSubscriptionAction } from '~/lib/kinder/platform/platform-ops-actions';
import type { PlatformSchoolDetail } from '~/lib/kinder/platform/types';

export function SubscriptionRepairPanel({
  school,
}: {
  school: PlatformSchoolDetail;
}) {
  const router = useRouter();
  const { t } = useTranslation('kinder');
  const [pending, startTransition] = useTransition();

  const onRepair = () => {
    startTransition(async () => {
      const promise = platformRepairSchoolSubscriptionAction({
        schoolId: school.id,
      });

      toast.promise(promise, {
        loading: t('platform.subscription.repairing'),
        success: t('platform.subscription.repaired'),
        error: t('ui.toast.error'),
      });

      try {
        await promise;
        router.refresh();
      } catch {
        // toast handles feedback
      }
    });
  };

  return (
    <PlatformSectionCard
      title={<Trans i18nKey="kinder:platform.subscription.repairTitle" />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <AlertTriangle className="size-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              <Trans i18nKey="kinder:platform.subscription.repairAlertTitle" />
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <Trans i18nKey="kinder:platform.subscription.repairAlertDescription" />
            </p>
          </div>
        </div>

        <Button
          className="min-h-11 w-full sm:w-auto"
          disabled={pending}
          onClick={onRepair}
          type="button"
        >
          <Sparkles data-icon="inline-start" className="size-4" />
          {pending ? (
            <Trans i18nKey="kinder:platform.subscription.repairing" />
          ) : (
            <Trans i18nKey="kinder:platform.subscription.repairAction" />
          )}
        </Button>
      </div>
    </PlatformSectionCard>
  );
}

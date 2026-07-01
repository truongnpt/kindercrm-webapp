import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Trans } from '@kit/ui/trans';

import type { Package } from '~/lib/kinder/types';

export function QuotaUsageBanner({
  package: pkg,
  usage,
}: {
  package: Package | null;
  usage: { campuses: number; students: number };
}) {
  if (!pkg) {
    return null;
  }

  const campusRatio = usage.campuses / pkg.max_campuses;
  const showCampusWarning = campusRatio >= 0.8;

  return (
    <Alert variant={showCampusWarning ? 'warning' : 'default'}>
      <AlertTitle>
        <Trans i18nKey="kinder:dashboard.usageTitle" />
      </AlertTitle>
      <AlertDescription className="flex flex-wrap gap-4">
        <span>
          <Trans
            i18nKey="kinder:dashboard.campusesUsed"
            values={{ used: usage.campuses, max: pkg.max_campuses }}
          />
        </span>
        <span>
          <Trans
            i18nKey="kinder:dashboard.studentsUsed"
            values={{ used: usage.students, max: pkg.max_students }}
          />
        </span>
      </AlertDescription>
    </Alert>
  );
}

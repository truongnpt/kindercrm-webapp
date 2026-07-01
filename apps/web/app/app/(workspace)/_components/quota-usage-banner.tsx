import { AlertTriangle } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { InlineAlert } from '~/components/kinder-ui';
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
  const studentRatio = usage.students / pkg.max_students;
  const showWarning = campusRatio >= 0.8 || studentRatio >= 0.8;

  return (
    <InlineAlert
      icon={showWarning ? AlertTriangle : undefined}
      title={<Trans i18nKey="kinder:dashboard.usageTitle" />}
      tone={showWarning ? 'warning' : 'default'}
    >
      <div className="flex flex-wrap gap-x-4 gap-y-1">
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
      </div>
    </InlineAlert>
  );
}

import Link from 'next/link';

import { AlertTriangle, Cake, Clock, FileWarning } from 'lucide-react';

import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { BentoTile } from '~/components/kinder-ui';
import type { StaffHrAlert } from '~/lib/kinder/staff/hr-types';

const ICONS = {
  contract_expiring: FileWarning,
  birthday: Cake,
  leave_pending: AlertTriangle,
  attendance_anomaly: Clock,
} as const;

const TONE_CLASS = {
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-900',
  info: 'border-primary/20 bg-primary/5 text-foreground',
  destructive: 'border-destructive/25 bg-destructive/10 text-destructive',
} as const;

export function StaffHrAlerts({ alerts }: { alerts: StaffHrAlert[] }) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <BentoTile className="mb-2">
      <h2 className="text-sm font-semibold tracking-tight">
        <Trans i18nKey="kinder:staff.alerts.title" />
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {alerts.map((alert) => {
          const Icon = ICONS[alert.type];
          const content = (
            <div
              className={cn(
                'flex items-start gap-3 rounded-2xl border p-3 text-sm transition-colors sm:p-4',
                TONE_CLASS[alert.tone],
                alert.href && 'hover:bg-muted/30',
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium">
                  <Trans i18nKey={alert.titleKey} values={alert.values} />
                </p>
                <p className="mt-1 opacity-90">
                  <Trans
                    i18nKey={alert.descriptionKey}
                    values={alert.values}
                  />
                </p>
              </div>
            </div>
          );

          return (
            <li key={alert.id}>
              {alert.href ?
                <Link className="block" href={alert.href}>
                  {content}
                </Link>
              : content}
            </li>
          );
        })}
      </ul>
    </BentoTile>
  );
}

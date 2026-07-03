'use client';

import Link from 'next/link';

import {
  BarChart3,
  CalendarCheck2,
  CalendarOff,
  CreditCard,
  HeartPulse,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react';

import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import pathsConfig from '~/config/paths.config';

export function ParentQuickActions({
  studentId,
  className,
}: {
  studentId: string;
  className?: string;
}) {
  const base = `${pathsConfig.parent.child}/${studentId}`;

  const actions = [
    {
      href: `${base}?tab=reports`,
      icon: BarChart3,
      labelKey: 'kinder:parent.tabs.reports',
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      href: `${base}?tab=attendance`,
      icon: CalendarCheck2,
      labelKey: 'kinder:parent.tabs.attendance',
      iconClass: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      href: `${base}?tab=leave`,
      icon: CalendarOff,
      labelKey: 'kinder:parent.tabs.leave',
      iconClass: 'bg-amber-500/10 text-amber-600',
    },
    {
      href: `${base}?tab=meals`,
      icon: UtensilsCrossed,
      labelKey: 'kinder:parent.tabs.meals',
      iconClass: 'bg-orange-500/10 text-orange-600',
    },
    {
      href: `${base}?tab=finance`,
      icon: CreditCard,
      labelKey: 'kinder:parent.tabs.finance',
      iconClass: 'bg-sky-500/10 text-sky-600',
    },
    {
      href: `${base}?tab=health`,
      icon: HeartPulse,
      labelKey: 'kinder:parent.tabs.health',
      iconClass: 'bg-rose-500/10 text-rose-600',
    },
    {
      href: `${base}?tab=profile`,
      icon: UserRound,
      labelKey: 'kinder:parent.tabs.profile',
      iconClass: 'bg-violet-500/10 text-violet-600',
    },
  ];

  return (
    <div className={cn('grid grid-cols-4 gap-2 sm:grid-cols-7', className)}>
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            className="parent-portal-quick-action"
            href={action.href}
            key={action.href}
          >
            <span
              className={cn(
                'flex size-10 items-center justify-center rounded-xl',
                action.iconClass,
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="text-foreground">
              <Trans i18nKey={action.labelKey} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

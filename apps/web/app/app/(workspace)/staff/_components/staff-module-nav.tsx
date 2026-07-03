'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  BarChart3,
  CalendarOff,
  Clock,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import type { StaffModulePermissions } from '~/lib/kinder/permissions';

const BASE_LINKS = [
  {
    href: pathsConfig.app.staff,
    labelKey: 'kinder:staff.tabs.employees',
    icon: Users,
    exact: true,
    visible: () => true,
  },
  {
    href: pathsConfig.app.staffAttendance,
    labelKey: 'kinder:staff.tabs.attendance',
    icon: Clock,
    exact: false,
    visible: (permissions: StaffModulePermissions) =>
      permissions.canViewAttendance,
  },
  {
    href: pathsConfig.app.staffLeave,
    labelKey: 'kinder:staff.tabs.leave',
    icon: CalendarOff,
    exact: false,
    visible: (permissions: StaffModulePermissions) => permissions.canViewLeave,
  },
  {
    href: pathsConfig.app.staffReports,
    labelKey: 'kinder:staff.tabs.reports',
    icon: BarChart3,
    exact: false,
    visible: (permissions: StaffModulePermissions) =>
      permissions.canAccessHrSections,
  },
  {
    href: pathsConfig.app.staffSetup,
    labelKey: 'kinder:staff.tabs.setup',
    icon: Settings,
    exact: false,
    visible: (permissions: StaffModulePermissions) => permissions.canManageSetup,
  },
  {
    href: pathsConfig.app.staffPermissions,
    labelKey: 'kinder:permissions.title',
    icon: ShieldCheck,
    exact: false,
    visible: (permissions: StaffModulePermissions) =>
      permissions.canManagePermissions,
  },
] as const;

export function StaffModuleNav({
  className,
  permissions,
}: {
  className?: string;
  permissions: StaffModulePermissions;
}) {
  const pathname = usePathname();
  const links = BASE_LINKS.filter((link) => link.visible(permissions));

  if (links.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Staff sections"
      className={cn(
        'flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {links.map(({ href, labelKey, icon: Icon, exact }) => {
        const active =
          exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors sm:px-4',
              active ?
                'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
            href={href}
            key={href}
          >
            <Icon className="size-4 shrink-0" />
            <span className="whitespace-nowrap">
              <Trans i18nKey={labelKey} />
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

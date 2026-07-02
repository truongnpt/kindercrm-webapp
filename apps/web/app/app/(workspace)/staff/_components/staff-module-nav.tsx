'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Settings, Users } from 'lucide-react';

import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';

const LINKS = [
  {
    href: pathsConfig.app.staff,
    labelKey: 'kinder:staff.tabs.employees',
    icon: Users,
    exact: true,
  },
  {
    href: pathsConfig.app.staffSetup,
    labelKey: 'kinder:staff.tabs.setup',
    icon: Settings,
    exact: false,
  },
] as const;

export function StaffModuleNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Staff sections"
      className={cn('flex flex-wrap gap-2', className)}
    >
      {LINKS.map(({ href, labelKey, icon: Icon, exact }) => {
        const active =
          exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors',
              active ?
                'border-primary/30 bg-primary/10 text-primary'
              : 'border-border bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
            href={href}
            key={href}
          >
            <Icon className="size-4" />
            <Trans i18nKey={labelKey} />
          </Link>
        );
      })}
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Package,
  Shield,
} from 'lucide-react';

import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import type { PlatformAdminRole } from '~/lib/kinder/platform/types';

const NAV_ITEMS: Array<{
  href: string;
  labelKey: string;
  icon: typeof LayoutDashboard;
  end: boolean;
  roles: PlatformAdminRole[];
}> = [
  {
    href: pathsConfig.platform.home,
    labelKey: 'kinder:platform.nav.dashboard',
    icon: LayoutDashboard,
    end: true,
    roles: ['super_admin', 'support', 'billing'],
  },
  {
    href: pathsConfig.platform.schools,
    labelKey: 'kinder:platform.nav.schools',
    icon: Building2,
    end: false,
    roles: ['super_admin', 'support'],
  },
  {
    href: pathsConfig.platform.packages,
    labelKey: 'kinder:platform.nav.packages',
    icon: Package,
    end: false,
    roles: ['super_admin', 'billing'],
  },
  {
    href: pathsConfig.platform.admins,
    labelKey: 'kinder:platform.nav.admins',
    icon: Shield,
    end: false,
    roles: ['super_admin'],
  },
  {
    href: pathsConfig.platform.auditLogs,
    labelKey: 'kinder:platform.nav.audit',
    icon: ClipboardList,
    end: false,
    roles: ['super_admin', 'support', 'billing'],
  },
];

export function PlatformNav({ platformRole }: { platformRole: PlatformAdminRole }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(platformRole));

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {items.map((item) => {
        const active = item.end
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Button
            asChild
            className={cn(
              'h-9 gap-2 rounded-xl px-3',
              active && 'bg-primary/10 text-primary hover:bg-primary/15',
            )}
            key={item.href}
            size="sm"
            variant={active ? 'secondary' : 'ghost'}
          >
            <Link href={item.href}>
              <Icon className="size-4" />
              <Trans i18nKey={item.labelKey} />
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

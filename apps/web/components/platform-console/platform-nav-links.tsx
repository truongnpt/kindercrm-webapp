'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import type { PlatformAdminRole } from '~/lib/kinder/platform/types';

import { getPlatformNavItems } from './platform-nav-config';

export function PlatformNavLinks({
  platformRole,
  onNavigate,
}: {
  platformRole: PlatformAdminRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = getPlatformNavItems(platformRole);

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.end
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            className={cn(
              'platform-console-nav-item',
              active
                ? 'platform-console-nav-item-active'
                : 'platform-console-nav-item-inactive',
            )}
            href={item.href}
            key={item.href}
            onClick={onNavigate}
          >
            <Icon className="size-4 shrink-0" />
            <Trans i18nKey={item.labelKey} />
          </Link>
        );
      })}
    </nav>
  );
}

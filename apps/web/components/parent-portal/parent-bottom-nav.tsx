'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Bell,
  CalendarDays,
  Home,
  MessageCircle,
  User,
} from 'lucide-react';

import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import pathsConfig from '~/config/paths.config';

import { useParentPortal } from './parent-portal-context';

export function ParentBottomNav({
  onNotificationsOpen,
}: {
  onNotificationsOpen: () => void;
}) {
  const pathname = usePathname();
  const { unreadCount } = useParentPortal();

  const isHome = pathname === pathsConfig.parent.home;
  const isCalendar = pathname === pathsConfig.parent.calendar;
  const isMessages = pathname === pathsConfig.parent.messages;
  const isProfile = pathname === pathsConfig.parent.account;

  const items = [
    {
      key: 'home',
      href: pathsConfig.parent.home,
      icon: Home,
      labelKey: 'kinder:parent.nav.home',
      active: isHome,
    },
    {
      key: 'calendar',
      href: pathsConfig.parent.calendar,
      icon: CalendarDays,
      labelKey: 'kinder:parent.nav.calendar',
      active: isCalendar,
    },
    {
      key: 'messages',
      href: pathsConfig.parent.messages,
      icon: MessageCircle,
      labelKey: 'kinder:parent.nav.messages',
      active: isMessages,
    },
    {
      key: 'notifications',
      icon: Bell,
      labelKey: 'kinder:parent.nav.notifications',
      active: false,
      badge: unreadCount,
      onClick: onNotificationsOpen,
    },
    {
      key: 'profile',
      href: pathsConfig.parent.account,
      icon: User,
      labelKey: 'kinder:parent.nav.profile',
      active: isProfile,
    },
  ] as const;

  return (
    <nav
      aria-label="Parent portal navigation"
      className="parent-portal-bottom-nav lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1">
        {items.map((item) => {
          const Icon = item.icon;
          const className = cn(
            'parent-portal-nav-item',
            item.active
              ? 'parent-portal-nav-item-active'
              : 'parent-portal-nav-item-inactive',
          );

          const inner = (
            <>
              <span className="relative flex items-center justify-center">
                <Icon className="size-5" />
                {'badge' in item && item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </span>
              <Trans i18nKey={item.labelKey} />
            </>
          );

          if ('onClick' in item && item.onClick) {
            return (
              <button
                className={className}
                key={item.key}
                onClick={item.onClick}
                type="button"
              >
                {inner}
              </button>
            );
          }

          return (
            <Link className={className} href={item.href!} key={item.key}>
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

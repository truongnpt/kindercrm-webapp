'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import {
  Bell,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CalendarOff,
  CreditCard,
  HeartPulse,
  Home,
  MessageCircle,
  User,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react';

import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import pathsConfig from '~/config/paths.config';

import { useParentPortal } from './parent-portal-context';

export function ParentDesktopNav({
  onNotificationsOpen,
}: {
  onNotificationsOpen: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { primaryChildId, unreadCount } = useParentPortal();

  const childRouteMatch = pathname.match(
    new RegExp(`^${pathsConfig.parent.child}/([^/]+)`),
  );
  const activeStudentId = childRouteMatch?.[1] ?? primaryChildId;

  const childBase = activeStudentId
    ? `${pathsConfig.parent.child}/${activeStudentId}`
    : null;

  const mainItems = [
    {
      href: pathsConfig.parent.home,
      icon: Home,
      labelKey: 'kinder:parent.nav.home',
      active: pathname === pathsConfig.parent.home,
    },
    {
      href: pathsConfig.parent.calendar,
      icon: CalendarDays,
      labelKey: 'kinder:parent.nav.calendar',
      active: pathname === pathsConfig.parent.calendar,
    },
    {
      href: pathsConfig.parent.messages,
      icon: MessageCircle,
      labelKey: 'kinder:parent.nav.messages',
      active: pathname === pathsConfig.parent.messages,
    },
    {
      href: pathsConfig.parent.account,
      icon: User,
      labelKey: 'kinder:parent.nav.profile',
      active: pathname === pathsConfig.parent.account,
    },
  ];

  const childTabs = childBase
    ? [
        {
          href: `${childBase}?tab=reports`,
          icon: BookOpen,
          labelKey: 'kinder:parent.tabs.reports',
          tab: 'reports',
        },
        {
          href: `${childBase}?tab=attendance`,
          icon: CalendarCheck2,
          labelKey: 'kinder:parent.tabs.attendance',
          tab: 'attendance',
        },
        {
          href: `${childBase}?tab=leave`,
          icon: CalendarOff,
          labelKey: 'kinder:parent.tabs.leave',
          tab: 'leave',
        },
        {
          href: `${childBase}?tab=meals`,
          icon: UtensilsCrossed,
          labelKey: 'kinder:parent.tabs.meals',
          tab: 'meals',
        },
        {
          href: `${childBase}?tab=finance`,
          icon: CreditCard,
          labelKey: 'kinder:parent.tabs.finance',
          tab: 'finance',
        },
        {
          href: `${childBase}?tab=health`,
          icon: HeartPulse,
          labelKey: 'kinder:parent.tabs.health',
          tab: 'health',
        },
        {
          href: `${childBase}?tab=profile`,
          icon: UserRound,
          labelKey: 'kinder:parent.tabs.profile',
          tab: 'profile',
        },
      ]
    : [];

  const activeTab = searchParams.get('tab') ?? 'reports';
  const onChildPage = pathname.startsWith(`${pathsConfig.parent.child}/`);

  return (
    <aside className="parent-portal-desktop-sidebar">
      <p className="mb-4 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        <Trans i18nKey="kinder:parent.title" />
      </p>

      <div className="flex flex-col gap-1">
        {mainItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className={cn(
                'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="size-4" />
              <Trans i18nKey={item.labelKey} />
            </Link>
          );
        })}

        <button
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={onNotificationsOpen}
          type="button"
        >
          <span className="relative">
            <Bell className="size-4" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
          </span>
          <Trans i18nKey="kinder:parent.nav.notifications" />
        </button>
      </div>

      {childTabs.length > 0 ? (
        <>
          <p className="mt-6 mb-2 px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <Trans i18nKey="kinder:parent.childDetail" />
          </p>
          <div className="flex flex-col gap-1">
            {childTabs.map((item) => {
              const Icon = item.icon;
              const active = onChildPage && activeTab === item.tab;

              return (
                <Link
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  href={item.href}
                  key={item.tab}
                >
                  <Icon className="size-4" />
                  <Trans i18nKey={item.labelKey} />
                </Link>
              );
            })}
          </div>
        </>
      ) : null}
    </aside>
  );
}

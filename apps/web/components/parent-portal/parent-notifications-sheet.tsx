'use client';

import Link from 'next/link';
import { useTransition } from 'react';

import { Bell, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@kit/ui/sheet';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from '~/lib/kinder/notifications/server-actions';
import type {
  NotificationCategory,
  UserNotification,
} from '~/lib/kinder/notifications/types';

function formatNotificationTime(
  iso: string,
  locale: string,
  labels: { yesterday: string },
) {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );
  const time = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (dayDiff === 0) {
    return time;
  }

  if (dayDiff === 1) {
    return `${labels.yesterday} · ${time}`;
  }

  if (dayDiff < 7) {
    return `${date.toLocaleDateString(locale, { weekday: 'short' })} · ${time}`;
  }

  return `${date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  })} · ${time}`;
}

const CATEGORY_KEYS: Partial<Record<NotificationCategory, string>> = {
  calendar: 'notifications.categories.calendar',
  communication: 'notifications.categories.communication',
  daily_report: 'notifications.categories.daily_report',
  inventory: 'notifications.categories.inventory',
  menu: 'notifications.categories.menu',
  subscription: 'notifications.categories.subscription',
  system: 'notifications.categories.system',
};

export function ParentNotificationsSheet({
  open,
  onOpenChange,
  notifications,
  unreadCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: UserNotification[];
  unreadCount: number;
}) {
  const { t, i18n } = useTranslation('kinder');
  const [pending, startTransition] = useTransition();

  const handleDismiss = () => {
    onOpenChange(false);
  };

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent
        className={cn(
          'parent-notifications-sheet flex w-full flex-col gap-0 p-0 sm:max-w-md',
          '[&>button]:hidden',
        )}
        side="bottom"
      >
        <div
          aria-hidden
          className="parent-notifications-sheet-handle"
        />

        <SheetHeader className="parent-notifications-sheet-header shrink-0 space-y-0">
          <div className="flex items-center gap-2 pr-10">
            <SheetTitle className="flex min-w-0 flex-1 items-center gap-2 text-base">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Bell className="size-4 text-primary" />
              </span>
              <span className="truncate">
                <Trans i18nKey="kinder:notifications.title" />
              </span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </SheetTitle>
          </div>

          <SheetClose asChild>
            <Button
 aria-label={t('notifications.close')}className="absolute top-3.5 right-3"
 size="icon"
 type="button"
 variant="ghost"
 >
              <X className="size-5" />
            </Button>
          </SheetClose>

          {unreadCount > 0 ? (
            <Button className="mt-3 w-full"
 disabled={pending}
 onClick={() => {
                startTransition(async () => {
                  await markAllNotificationsReadAction({});
                });
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              <Trans i18nKey="kinder:notifications.markAllRead" />
            </Button>
          ) : null}
        </SheetHeader>

        <div className="parent-notifications-sheet-list min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Bell className="size-6 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                <Trans i18nKey="kinder:notifications.empty" />
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <NotificationRow
                    locale={i18n.language}
                    notification={notification}
                    onDismiss={handleDismiss}
                    onRead={() => {
                      if (!notification.read_at) {
                        startTransition(async () => {
                          await markNotificationReadAction({
                            notificationId: notification.id,
                          });
                        });
                      }
                    }}
                    t={t}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NotificationRow({
  notification,
  onRead,
  onDismiss,
  t,
  locale,
}: {
  notification: UserNotification;
  onRead: () => void;
  onDismiss: () => void;
  t: (key: string) => string;
  locale: string;
}) {
  const isUnread = !notification.read_at;
  const categoryKey = CATEGORY_KEYS[notification.category];
  const categoryLabel = categoryKey ? t(categoryKey) : null;

  const content = (
    <div
      className={cn(
        'parent-notifications-sheet-row block w-full px-4 py-3.5 text-left transition-colors active:bg-muted/80',
        isUnread && 'border-l-2 border-l-primary bg-primary/5',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-2 size-2 shrink-0 rounded-full',
            isUnread ? 'bg-primary' : 'bg-transparent',
          )}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                'line-clamp-2 text-sm leading-snug text-foreground',
                isUnread ? 'font-semibold' : 'font-medium',
              )}
            >
              {notification.title}
            </p>
            <time
              className="shrink-0 pt-0.5 text-[11px] leading-none text-muted-foreground tabular-nums"
              dateTime={notification.created_at}
            >
              {formatNotificationTime(notification.created_at, locale, {
                yesterday: t('notifications.yesterday'),
              })}
            </time>
          </div>

          {notification.body ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {notification.body}
            </p>
          ) : null}

          {categoryLabel ? (
            <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {categoryLabel}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );

  const handleActivate = () => {
    onRead();
    onDismiss();
  };

  if (notification.link_url) {
    return (
      <Link
        className="block touch-manipulation"
        href={notification.link_url}
        onClick={handleActivate}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className="block w-full touch-manipulation"
      onClick={() => {
        onRead();
      }}
      type="button"
    >
      {content}
    </button>
  );
}

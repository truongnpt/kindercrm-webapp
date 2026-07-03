'use client';

import Link from 'next/link';
import { useTransition } from 'react';

import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@kit/ui/popover';
import { Trans } from '@kit/ui/trans';

import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from '~/lib/kinder/notifications/server-actions';
import type { UserNotification } from '~/lib/kinder/notifications/types';

export function ParentNotificationsBell({
  notifications,
  unreadCount,
}: {
  notifications: UserNotification[];
  unreadCount: number;
}) {
  const { t } = useTranslation('kinder');
  const [pending, startTransition] = useTransition();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="relative" size="icon" type="button" variant="ghost">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-medium">
            <Trans i18nKey="kinder:notifications.title" />
          </p>
          {unreadCount > 0 ? (
            <Button
 disabled={pending}
 onClick={() => {
                startTransition(async () => {
                  await markAllNotificationsReadAction({});
                });
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Trans i18nKey="kinder:notifications.markAllRead" />
            </Button>
          ) : null}
        </div>
        {notifications.length === 0 ? (
          <p className="text-muted-foreground p-4 text-sm">
            <Trans i18nKey="kinder:notifications.empty" />
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <li className="border-b last:border-b-0" key={notification.id}>
                <NotificationRow
                  notification={notification}
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
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({
  notification,
  onRead,
  t,
}: {
  notification: UserNotification;
  onRead: () => void;
  t: (key: string) => string;
}) {
  const content = (
    <div
      className={`hover:bg-muted/50 px-3 py-2 text-sm ${notification.read_at ? 'opacity-60' : ''}`}
    >
      <p className="font-medium">{notification.title}</p>
      {notification.body ? (
        <p className="text-muted-foreground text-xs">{notification.body}</p>
      ) : null}
      <p className="text-muted-foreground mt-1 text-[10px]">
        {new Date(notification.created_at).toLocaleString()}
      </p>
      {notification.category === 'daily_report' ? (
        <p className="text-primary mt-0.5 text-[10px]">
          {t('notifications.dailyReport')}
        </p>
      ) : null}
    </div>
  );

  if (notification.link_url) {
    return (
      <Link className="block" href={notification.link_url} onClick={onRead}>
        {content}
      </Link>
    );
  }

  return (
    <button className="w-full text-left" onClick={onRead} type="button">
      {content}
    </button>
  );
}

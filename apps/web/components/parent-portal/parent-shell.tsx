'use client';

import { Suspense, useState } from 'react';

import { ParentBottomNav } from './parent-bottom-nav';
import { ParentDesktopNav } from './parent-desktop-nav';
import { ParentHeader } from './parent-header';
import { ParentNotificationsSheet } from './parent-notifications-sheet';
import { ParentPortalProvider } from './parent-portal-context';
import type { ParentPortalContextValue } from './parent-portal-context';

type ParentShellProps = React.PropsWithChildren<{
  portal: ParentPortalContextValue;
}>;

export function ParentShell({ portal, children }: ParentShellProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <ParentPortalProvider value={portal}>
      <div className="parent-portal flex min-h-screen flex-col">
        <ParentHeader />

        <div className="mx-auto flex flex-1 w-full">
        <Suspense fallback={null}>
          <ParentDesktopNav
            onNotificationsOpen={() => setNotificationsOpen(true)}
          />
        </Suspense>

          <div className="min-w-0 flex-1">
            <main className="parent-portal-main">{children}</main>
          </div>
        </div>

        <Suspense fallback={null}>
          <ParentBottomNav
            onNotificationsOpen={() => setNotificationsOpen(true)}
          />
        </Suspense>

        <ParentNotificationsSheet
          notifications={portal.notifications}
          onOpenChange={setNotificationsOpen}
          open={notificationsOpen}
          unreadCount={portal.unreadCount}
        />
      </div>
    </ParentPortalProvider>
  );
}

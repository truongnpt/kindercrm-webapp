import { redirect } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadParentLinksForUser } from '~/lib/kinder/parent/load-parent';
import {
  loadUnreadNotificationCount,
  loadUserNotifications,
} from '~/lib/kinder/notifications/load-notifications';
import { loadUserSchools } from '~/lib/kinder/tenant/get-school-context';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { ParentHeaderActions } from './_components/parent-header-actions';
import { ParentNotificationsBell } from './_components/parent-notifications-bell';

async function ParentRootLayout({ children }: React.PropsWithChildren) {
  const user = await requireUserInServerComponent();
  const [childrenLinks, memberships, notifications, unreadCount] =
    await Promise.all([
    loadParentLinksForUser(user.id),
    loadUserSchools(user.id),
    loadUserNotifications(user.id),
    loadUnreadNotificationCount(user.id),
  ]);

  if (childrenLinks.length === 0) {
    redirect(pathsConfig.app.home);
  }

  const hasStaffAccess = memberships.some(
    (membership) => membership.role !== 'parent',
  );

  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="bg-background border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-semibold">
              <Trans i18nKey="kinder:parent.title" />
            </p>
            <p className="text-muted-foreground text-sm">
              <Trans i18nKey="kinder:parent.subtitle" />
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ParentNotificationsBell
              notifications={notifications}
              unreadCount={unreadCount}
            />
            <ParentHeaderActions hasStaffAccess={hasStaffAccess} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

export default withI18n(ParentRootLayout);

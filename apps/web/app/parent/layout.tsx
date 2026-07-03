import { redirect } from 'next/navigation';

import { ParentShell } from '~/components/parent-portal';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadParentLinksForUser } from '~/lib/kinder/parent/load-parent';
import {
  loadUnreadNotificationCount,
  loadUserNotifications,
} from '~/lib/kinder/notifications/load-notifications';
import { loadUserSchools } from '~/lib/kinder/tenant/get-school-context';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

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

  const primaryChild =
    childrenLinks.find((child) => child.isPrimary) ?? childrenLinks[0] ?? null;

  return (
    <ParentShell
      portal={{
        user,
        children: childrenLinks,
        primaryChildId: primaryChild?.studentId ?? null,
        notifications,
        unreadCount,
        hasStaffAccess,
      }}
    >
      {children}
    </ParentShell>
  );
}

export default withI18n(ParentRootLayout);

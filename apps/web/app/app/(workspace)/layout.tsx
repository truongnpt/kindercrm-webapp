import { use } from 'react';

import { redirect } from 'next/navigation';

import { Page, PageMobileNavigation, PageNavigation } from '@kit/ui/page';
import { SidebarProvider } from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import { navigationConfig } from '~/config/navigation.config';
import pathsConfig from '~/config/paths.config';
import { getKinderNavigationConfig } from '~/lib/kinder/navigation/get-kinder-navigation';
import {
  loadUnreadNotificationCount,
  loadUserNotifications,
} from '~/lib/kinder/notifications/load-notifications';
import {
  getSchoolContext,
  loadUserSchools,
} from '~/lib/kinder/tenant/get-school-context';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { AppMobileNavigation } from '../_components/app-mobile-navigation';
import { AppSidebar } from '../_components/app-sidebar';

function WorkspaceLayout({ children }: React.PropsWithChildren) {
  const { user, context, schools, navigation, notifications, unreadCount } =
    use(loadWorkspaceData());

  if (!context) {
    redirect(pathsConfig.app.onboarding);
  }

  const sidebarDefaultOpen = !navigationConfig.sidebarCollapsed;

  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen}>
      <Page style={'sidebar'}>
        <PageNavigation>
          <AppSidebar
            activeSchoolId={context.school.id}
            navigation={navigation}
            notifications={notifications}
            schools={schools}
            unreadCount={unreadCount}
            user={user}
          />
        </PageNavigation>

        <PageMobileNavigation className={'flex items-center justify-between gap-2'}>
          <AppLogo href={pathsConfig.app.home} />
          <AppMobileNavigation
            navigation={navigation}
            notifications={notifications}
            unreadCount={unreadCount}
          />
        </PageMobileNavigation>

        {children}
      </Page>
    </SidebarProvider>
  );
}

async function loadWorkspaceData() {
  const user = await requireUserInServerComponent();
  const [context, memberships] = await Promise.all([
    getSchoolContext(user.id),
    loadUserSchools(user.id),
  ]);

  if (!context && memberships.length === 0) {
    const { loadParentLinksForUser } = await import(
      '~/lib/kinder/parent/load-parent'
    );
    const parentLinks = await loadParentLinksForUser(user.id);

    if (parentLinks.length > 0) {
      redirect(pathsConfig.parent.home);
    }
  }

  const staffMemberships = memberships.filter(
    (membership) => membership.role !== 'parent',
  );

  if (staffMemberships.length === 0) {
    const { loadParentLinksForUser } = await import(
      '~/lib/kinder/parent/load-parent'
    );
    const parentLinks = await loadParentLinksForUser(user.id);

    if (parentLinks.length > 0) {
      redirect(pathsConfig.parent.home);
    }
  }

  const [notifications, unreadCount] = context
    ? await Promise.all([
        loadUserNotifications(user.id),
        loadUnreadNotificationCount(user.id),
      ])
    : [[], 0];

  const navigation = context
    ? getKinderNavigationConfig(context.package)
    : navigationConfig;

  return {
    user,
    context,
    schools: memberships.map((m) => ({
      id: m.school.id,
      name: m.school.name,
      role: m.role,
    })),
    navigation,
    notifications,
    unreadCount,
  };
}

export default withI18n(WorkspaceLayout);

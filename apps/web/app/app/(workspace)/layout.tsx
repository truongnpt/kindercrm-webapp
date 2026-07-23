import { use } from 'react';

import { redirect } from 'next/navigation';

import { SidebarProvider } from '@kit/ui/shadcn-sidebar';

import { navigationConfig } from '~/config/navigation.config';
import pathsConfig from '~/config/paths.config';
import { getKinderNavigationConfig } from '~/lib/kinder/navigation/get-kinder-navigation';
import { loadMemberPermissions } from '~/lib/kinder/permissions';
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

import { getPlatformAdminContext, redirectIfPlatformAdmin } from '~/lib/kinder/platform/require-platform-admin';
import { isStripeBillingEnabled } from '~/lib/kinder/billing/stripe-config';

import {
  WorkspaceHeader,
  WorkspaceMobileHeader,
} from '~/components/kinder-ui';

import { AppSidebar } from '../_components/app-sidebar';
import { BillingStatusBanner } from './_components/billing-status-banner';
import { TrialBanner } from './_components/trial-banner';
import { AppModule } from '../_components/app-module';

function WorkspaceLayout({ children }: React.PropsWithChildren) {
  const { user, context, schools, navigation, notifications, unreadCount, showPlatformLink } =
    use(loadWorkspaceData());

  if (context.school.status === 'suspended') {
    redirect(pathsConfig.app.suspended);
  }

  const primaryColor = context.school.theme_primary_color || '#034cf8';

  const sidebarDefaultOpen = !navigationConfig.sidebarCollapsed;

    const customTheme = {
            "--primary": primaryColor,
            "--color-primary": primaryColor,
            "--color-secondary-foreground": primaryColor,
            "--color-sidebar-accent-foreground": primaryColor,
            "--color-accent-foreground": primaryColor,
            "--color-accent": `color-mix(in srgb, ${primaryColor} 8%, white)`,
            "--color-secondary": `color-mix(in srgb, ${primaryColor} 8%, white)`,
            "--color-sidebar-accent": `color-mix(in srgb, ${primaryColor} 8%, white)`
          } as React.CSSProperties

  return (
    <SidebarProvider
      className="flex h-dvh w-full overflow-hidden bg-background"
      defaultOpen={sidebarDefaultOpen}
      style={customTheme}
    >
      <AppModule school={context.school} />
      <AppSidebar
        activeSchoolId={context.school.id}
        school={context.school}
        navigation={navigation}
        schools={schools}
        user={user}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <WorkspaceMobileHeader
          activeSchoolId={context.school.id}
          navigation={navigation}
          notifications={notifications}
          schools={schools}
          showPlatformLink={showPlatformLink}
          unreadCount={unreadCount}
          user={user}
        />

        <WorkspaceHeader
          activeSchoolId={context.school.id}
          navigation={navigation}
          notifications={notifications}
          schools={schools}
          showPlatformLink={showPlatformLink}
          unreadCount={unreadCount}
          user={user}
        />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-muted lg:rounded-tl-lg lg:border-t-1 lg:border-l-1 lg:border-gray-200">
          <div className="mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8">
            <BillingStatusBanner
              isOwner={context.role === 'owner'}
              schoolId={context.school.id}
              stripeCustomerId={context.subscription?.stripe_customer_id ?? null}
              stripeEnabled={isStripeBillingEnabled()}
              subscription={context.subscription}
            />
            <TrialBanner
              package={context.package}
              subscription={context.subscription}
            />
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

async function loadWorkspaceData() {
  const user = await requireUserInServerComponent();
  const [context, memberships, platformAdmin] = await Promise.all([
    getSchoolContext(user.id),
    loadUserSchools(user.id),
    getPlatformAdminContext(user.id),
  ]);

  if (!context && memberships.length === 0) {
    const { loadParentLinksForUser } = await import(
      '~/lib/kinder/parent/load-parent'
    );
    const parentLinks = await loadParentLinksForUser(user.id);

    if (parentLinks.length > 0) {
      redirect(pathsConfig.parent.home);
    }

    if (platformAdmin) {
      redirect(pathsConfig.platform.home);
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

  const [notifications, unreadCount, memberPermissions] = context
    ? await Promise.all([
        loadUserNotifications(user.id),
        loadUnreadNotificationCount(user.id),
        loadMemberPermissions(
          context.school.id,
          context.role,
          context.customRoleId,
        ),
      ])
    : [[], 0, undefined];

  const navigation = context
    ? getKinderNavigationConfig(
        context.effectivePackage ?? context.package,
        context.subscription,
        memberPermissions,
      )
    : navigationConfig;

  if (!context) {
    await redirectIfPlatformAdmin(user.id);
    redirect(pathsConfig.app.onboarding);
  }

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
    showPlatformLink: Boolean(platformAdmin),
  };
}

export default withI18n(WorkspaceLayout);

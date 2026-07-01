import type { JwtPayload } from '@supabase/supabase-js';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
} from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import type { navigationConfig } from '~/config/navigation.config';
import pathsConfig from '~/config/paths.config';
import type { UserNotification } from '~/lib/kinder/notifications/types';
import type { SchoolMemberRole } from '~/lib/kinder/types';

import { ParentNotificationsBell } from '../../parent/_components/parent-notifications-bell';

import { AppAccountDropdown } from './app-account-dropdown';
import { SchoolSwitcher } from './school-switcher';

export function AppSidebar({
  user,
  schools,
  activeSchoolId,
  navigation,
  notifications,
  unreadCount,
}: {
  user: JwtPayload;
  schools: Array<{ id: string; name: string; role: SchoolMemberRole }>;
  activeSchoolId: string;
  navigation: typeof navigationConfig;
  notifications: UserNotification[];
  unreadCount: number;
}) {
  return (
    <Sidebar collapsible={'icon'}>
      <SidebarHeader className={'h-16 justify-center'}>
        <div className={'flex items-center justify-between space-x-2'}>
          <AppLogo className={'max-w-full'} href={pathsConfig.app.home} />
          <ParentNotificationsBell
            notifications={notifications}
            unreadCount={unreadCount}
          />
        </div>

        <SchoolSwitcher activeSchoolId={activeSchoolId} schools={schools} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation config={navigation} />
      </SidebarContent>

      <SidebarFooter>
        <AppAccountDropdown user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

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
import type { SchoolMemberRole } from '~/lib/kinder/types';

import { AppAccountDropdown } from './app-account-dropdown';
import { SchoolSwitcher } from './school-switcher';
import { Separator } from '@kit/ui/separator';
import { AppSidebarLogo } from '@/components/app-sidebar-logo';

export function AppSidebar({
  user,
  schools,
  activeSchoolId,
  navigation,
}: {
  user: JwtPayload;
  schools: Array<{ id: string; name: string; role: SchoolMemberRole }>;
  activeSchoolId: string;
  navigation: typeof navigationConfig;
}) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-3 px-4 py-2">
        <div className="flex h-9 items-center group-data-[collapsible=icon]:justify-center">
          <AppSidebarLogo className="max-w-full" href={pathsConfig.app.home} />
        </div>

        <Separator />
      </SidebarHeader>

      <SidebarContent className="gap-0.5 px-2 py-3 kinder-scrollbar">
        <SidebarNavigation config={navigation} />
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Separator />
        <div className="group-data-[collapsible=icon]:hidden">
          <SchoolSwitcher activeSchoolId={activeSchoolId} schools={schools} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

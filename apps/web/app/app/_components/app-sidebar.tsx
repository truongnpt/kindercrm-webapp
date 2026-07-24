import type { JwtPayload } from '@supabase/supabase-js';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
} from '@kit/ui/shadcn-sidebar';

import type { navigationConfig } from '~/config/navigation.config';
import pathsConfig from '~/config/paths.config';
import type { School } from '~/lib/kinder/types';

import { Separator } from '@kit/ui/separator';
import { AppSidebarLogo } from '@/components/app-sidebar-logo';

export function AppSidebar({
  school,
  navigation,
}: {
  school: School;
  navigation: typeof navigationConfig;
}) {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-3 px-4 py-2">
        <div className="flex h-9 items-center group-data-[collapsible=icon]:justify-center">
          <AppSidebarLogo school={school} onlyTitle href={pathsConfig.app.home} />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0.5 px-2 py-3 kinder-scrollbar">
        <SidebarNavigation config={navigation} />
      </SidebarContent>

      <SidebarFooter className="h-14 lg:h-12">
        <Separator />
        <div className="group-data-[collapsible=icon]:p-2 lg:px-10 h-8 flex items-center justify-center">
          <AppSidebarLogo href="/" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

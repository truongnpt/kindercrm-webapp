'use client';

import type { JwtPayload } from '@supabase/supabase-js';

import dynamic from 'next/dynamic';

import { Menu, MoreHorizontal, Search, Shield } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { LanguageToggle } from '@kit/ui/language-toggle';
import { useSidebar } from '@kit/ui/shadcn-sidebar';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import type { navigationConfig } from '~/config/navigation.config';
import type { UserNotification } from '~/lib/kinder/notifications/types';
import type { SchoolMemberRole } from '~/lib/kinder/types';

import { ParentNotificationsBell } from '../../app/parent/_components/parent-notifications-bell';
import { AppAccountDropdown } from '../../app/app/_components/app-account-dropdown';
import { SchoolSwitcher } from '../../app/app/_components/school-switcher';

import { WorkspaceSearch } from './workspace-search';

const ModeToggle = dynamic(
  () => import('@kit/ui/mode-toggle').then((mod) => mod.ModeToggle),
  { ssr: false },
);

export function WorkspaceMobileHeader({
  user,
  schools,
  activeSchoolId,
  navigation,
  notifications,
  unreadCount,
  showPlatformLink = false,
}: {
  user: JwtPayload;
  schools: Array<{ id: string; name: string; role: SchoolMemberRole }>;
  activeSchoolId: string;
  navigation: typeof navigationConfig;
  notifications: UserNotification[];
  unreadCount: number;
  showPlatformLink?: boolean;
}) {
  const { toggleSidebar } = useSidebar();

  const openSearch = () => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true }),
    );
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4 lg:hidden">
      <Button
 aria-label="Open menu"className="size-10 shrink-0"
 onClick={toggleSidebar}
 size="icon"
 type="button"
 variant="ghost"
 >
        <Menu className="size-5" />
      </Button>

      <div className="flex min-w-0 flex-1 justify-center">
        <AppLogo
          className="!h-8 !max-h-8 !max-w-[140px]"
          href={pathsConfig.app.home}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
 aria-label="More options"className="size-10 shrink-0"
 size="icon"
 type="button"
 variant="ghost"
 >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <div className="p-2">
            <SchoolSwitcher activeSchoolId={activeSchoolId} schools={schools} />
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={openSearch}>
            <Search className="mr-2 size-4" />
            <Trans i18nKey="kinder:workspace.search" />
          </DropdownMenuItem>

          {showPlatformLink ? (
            <DropdownMenuItem asChild>
              <Link href={pathsConfig.platform.home}>
                <Shield className="mr-2 size-4" />
                <Trans i18nKey="kinder:platform.nav.short" />
              </Link>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <ParentNotificationsBell
              notifications={notifications}
              unreadCount={unreadCount}
            />
            {featuresFlagConfig.enableThemeToggle ? (
              <ModeToggle className="rounded-lg" />
            ) : null}
            <LanguageToggle />
          </div>

          <DropdownMenuSeparator />

          <div className="p-2">
            <AppAccountDropdown user={user} className="w-full" />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="sr-only">
        <WorkspaceSearch navigation={navigation} />
      </div>
    </header>
  );
}

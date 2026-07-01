'use client';

import type { JwtPayload } from '@supabase/supabase-js';

import Link from 'next/link';

import dynamic from 'next/dynamic';

import { Shield } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { SidebarTrigger } from '@kit/ui/shadcn-sidebar';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import type { navigationConfig } from '~/config/navigation.config';
import pathsConfig from '~/config/paths.config';
import featuresFlagConfig from '~/config/feature-flags.config';
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

export function WorkspaceHeader({
  user,
  schools,
  activeSchoolId,
  navigation,
  notifications,
  unreadCount,
  showPlatformLink = false,
  className,
}: {
  user: JwtPayload;
  schools: Array<{ id: string; name: string; role: SchoolMemberRole }>;
  activeSchoolId: string;
  navigation: typeof navigationConfig;
  notifications: UserNotification[];
  unreadCount: number;
  showPlatformLink?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 hidden h-16 shrink-0 border-b border-border bg-card lg:flex',
        className,
      )}
    >
      <div className="flex h-full w-full items-center gap-4 px-4 sm:px-6 lg:px-8">
        <SidebarTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground size-10 shrink-0 rounded-lg" />

        <div className="min-w-0 flex-1">
          <WorkspaceSearch navigation={navigation} />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden min-w-[148px] xl:block">
            <SchoolSwitcher activeSchoolId={activeSchoolId} schools={schools} />
          </div>

          <ParentNotificationsBell
            notifications={notifications}
            unreadCount={unreadCount}
          />

          {showPlatformLink ? (
            <Button
              asChild
              className="hidden rounded-lg xl:inline-flex"
              size="sm"
              variant="outline"
            >
              <Link href={pathsConfig.platform.home}>
                <Shield className="mr-1.5 size-4" />
                <Trans i18nKey="kinder:platform.nav.short" />
              </Link>
            </Button>
          ) : null}

          {featuresFlagConfig.enableThemeToggle ? (
            <ModeToggle className="rounded-lg" />
          ) : null}

          <AppAccountDropdown user={user} />
        </div>
      </div>
    </header>
  );
}

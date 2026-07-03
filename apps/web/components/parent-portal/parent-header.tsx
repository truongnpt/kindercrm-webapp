'use client';

import Link from 'next/link';

import dynamic from 'next/dynamic';

import { Shield } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { ParentAccountDropdown } from '~/parent/_components/parent-account-dropdown';
import { ParentNotificationsBell } from '~/parent/_components/parent-notifications-bell';
import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

import { useParentPortal } from './parent-portal-context';
import { AppLogo } from '../app-logo';

const ModeToggle = dynamic(
  () => import('@kit/ui/mode-toggle').then((mod) => mod.ModeToggle),
  { ssr: false },
);

export function ParentHeader() {
  const { hasStaffAccess, notifications, unreadCount, user } =
    useParentPortal();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full items-center justify-between gap-3 px-4 sm:px-6">
        <div className="min-w-0">
          <Link href={pathsConfig.app.home}>
          <AppLogo />
          </Link>
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-foreground sm:text-lg">
            <Trans i18nKey="kinder:parent.title" />
          </p>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            <Trans i18nKey="kinder:parent.subtitle" />
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          

          <div className="hidden lg:block">
            <ParentNotificationsBell
              notifications={notifications}
              unreadCount={unreadCount}
            />
          </div>

          {hasStaffAccess ? (
            <Button asChild className="hidden sm:inline-flex" size="sm" variant="outline">
              <Link href={pathsConfig.app.home}>
                <Shield className="mr-1.5 size-4" />
                <Trans i18nKey="kinder:parent.staffPortal" />
              </Link>
            </Button>
          ) : null}

          {featuresFlagConfig.enableThemeToggle ? (
            <ModeToggle className="hidden rounded-lg sm:inline-flex" />
          ) : null}

          <div className="hidden lg:block">
          <ParentAccountDropdown user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}

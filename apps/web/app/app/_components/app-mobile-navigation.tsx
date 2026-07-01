'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import dynamic from 'next/dynamic';

import { LogOut, Menu, Search } from 'lucide-react';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { LanguageToggle } from '@kit/ui/language-toggle';
import { Separator } from '@kit/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@kit/ui/sheet';
import { Button } from '@kit/ui/button';
import { cn, isRouteActive } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import type { JwtPayload } from '@supabase/supabase-js';

import featuresFlagConfig from '~/config/feature-flags.config';
import type { navigationConfig } from '~/config/navigation.config';
import type { UserNotification } from '~/lib/kinder/notifications/types';
import type { SchoolMemberRole } from '~/lib/kinder/types';

import { ParentNotificationsBell } from '../../parent/_components/parent-notifications-bell';
import { AppLogo } from '~/components/app-logo';

import { AppAccountDropdown } from './app-account-dropdown';
import { SchoolSwitcher } from './school-switcher';
import { WorkspaceSearch } from '~/components/kinder-ui/workspace-search';

const ModeToggle = dynamic(
  () => import('@kit/ui/mode-toggle').then((mod) => mod.ModeToggle),
  { ssr: false },
);

export function AppMobileNavigation({
  navigation,
  notifications,
  unreadCount,
  schools,
  activeSchoolId,
  user,
}: {
  navigation: typeof navigationConfig;
  notifications: UserNotification[];
  unreadCount: number;
  schools: Array<{ id: string; name: string; role: SchoolMemberRole }>;
  activeSchoolId: string;
  user: JwtPayload;
}) {
  const signOut = useSignOut();
  const pathname = usePathname();

  const links = navigation.routes.flatMap((item, index) => {
    if ('children' in item) {
      if (item.children.length === 0) {
        return [];
      }

      return [
        <p
          className="text-muted-foreground px-3 pt-3 pb-1 text-xs font-semibold tracking-wide first:pt-0"
          key={`group-${index}`}
        >
          <Trans defaults={item.label} i18nKey={item.label} />
        </p>,
        ...item.children.map((child) => (
          <SheetNavLink
            active={isRouteActive(child.path, pathname, child.end)}
            Icon={child.Icon}
            key={child.path}
            label={child.label}
            path={child.path}
          />
        )),
      ];
    }

    if ('divider' in item) {
      return [<Separator key={index} className="my-2" />];
    }

    return [];
  });

  return (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
      <Button
        aria-label="Search"
        className="size-9 shrink-0 rounded-xl"
        onClick={() => {
          document.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'k', metaKey: true }),
          );
        }}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Search className="size-4" />
      </Button>

      <ParentNotificationsBell
        notifications={notifications}
        unreadCount={unreadCount}
      />

      {featuresFlagConfig.enableThemeToggle ? (
        <ModeToggle className="hidden size-9 shrink-0 rounded-xl sm:inline-flex" />
      ) : null}

      <LanguageToggle className="hidden shrink-0 sm:inline-flex" />

      <Sheet>
        <SheetTrigger asChild>
          <Button
            aria-label="Open Menu"
            className="size-9 rounded-xl"
            size="icon"
            type="button"
            variant="ghost"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-sm"
          side="left"
        >
          <SheetHeader className="border-b border-border/50 px-5 py-4 text-left">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <AppLogo />
            <div className="mt-3">
              <SchoolSwitcher activeSchoolId={activeSchoolId} schools={schools} />
            </div>
          </SheetHeader>

          <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
            {links}
          </nav>

          <div className="border-t border-border/50 p-3">
            <div className="mb-3 flex items-center justify-between gap-2 px-2 sm:hidden">
              {featuresFlagConfig.enableThemeToggle ? (
                <ModeToggle className="rounded-xl" />
              ) : null}
              <LanguageToggle />
            </div>
            <div className="mb-2 px-2">
              <AppAccountDropdown user={user} />
            </div>
            <SignOutNavItem onSignOut={() => signOut.mutateAsync()} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden">
        <WorkspaceSearch navigation={navigation} />
      </div>
    </div>
  );
}

function SheetNavLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ReactNode;
    active?: boolean;
  }>,
) {
  return (
    <SheetClose asChild>
      <Link
        className={cn(
          'flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150',
          props.active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        )}
        href={props.path}
      >
        {props.Icon}
        <span>
          <Trans defaults={props.label} i18nKey={props.label} />
        </span>
      </Link>
    </SheetClose>
  );
}

function SignOutNavItem(props: { onSignOut: () => unknown }) {
  return (
    <SheetClose asChild>
      <button
        className="text-muted-foreground hover:bg-muted/60 hover:text-foreground flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150"
        onClick={props.onSignOut}
        type="button"
      >
        <LogOut className="size-4" />
        <span>
          <Trans defaults="Sign out" i18nKey="common:signOut" />
        </span>
      </button>
    </SheetClose>
  );
}

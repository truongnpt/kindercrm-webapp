'use client';

import Link from 'next/link';

import { LogOut, Menu } from 'lucide-react';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { LanguageToggle } from '@kit/ui/language-toggle';
import { Separator } from '@kit/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@kit/ui/sheet';
import { Trans } from '@kit/ui/trans';

import { ParentNotificationsBell } from '../../parent/_components/parent-notifications-bell';
import { AppLogo } from '~/components/app-logo';
import type { navigationConfig } from '~/config/navigation.config';
import type { UserNotification } from '~/lib/kinder/notifications/types';

export function AppMobileNavigation({
  navigation,
  notifications,
  unreadCount,
}: {
  navigation: typeof navigationConfig;
  notifications: UserNotification[];
  unreadCount: number;
}) {
  const signOut = useSignOut();

  const links = navigation.routes.flatMap((item, index) => {
    if ('children' in item) {
      return item.children.map((child) => (
        <SheetNavLink
          key={child.path}
          Icon={child.Icon}
          label={child.label}
          path={child.path}
        />
      ));
    }

    if ('divider' in item) {
      return [<Separator key={index} />];
    }

    return [];
  });

  return (
    <div className={'flex items-center gap-2'}>
      <ParentNotificationsBell
        notifications={notifications}
        unreadCount={unreadCount}
      />
      <LanguageToggle />

      <Sheet>
        <SheetTrigger aria-label={'Open Menu'}>
          <Menu className={'h-9'} />
        </SheetTrigger>

        <SheetContent
          className={'flex h-full w-full flex-col sm:max-w-sm'}
          side={'left'}
        >
          <AppLogo />
          <nav className={'mt-8 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto'}>
            {links}
          </nav>

          <Separator className={'my-0 shrink-0'} />

          <div className={'shrink-0'}>
            <SignOutNavItem onSignOut={() => signOut.mutateAsync()} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SheetNavLink(
  props: React.PropsWithChildren<{
    path: string;
    label: string;
    Icon: React.ReactNode;
  }>,
) {
  return (
    <SheetClose asChild>
      <Link
        className={
          'hover:bg-accent flex h-12 w-full items-center space-x-4 rounded-md px-3'
        }
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
        className={
          'hover:bg-accent flex h-12 w-full items-center space-x-4 rounded-md px-3'
        }
        onClick={props.onSignOut}
        type={'button'}
      >
        <LogOut className={'h-6'} />

        <span>
          <Trans defaults={'Sign out'} i18nKey={'common:signOut'} />
        </span>
      </button>
    </SheetClose>
  );
}

'use client';

import type { JwtPayload } from '@supabase/supabase-js';

import type { PlatformAdminRole } from '~/lib/kinder/platform/types';

import { PlatformConsoleProvider } from './platform-context';
import { PlatformMobileHeader } from './platform-mobile-header';
import { PlatformSidebar } from './platform-sidebar';
import { PlatformHeader } from './platform-header';

export function PlatformShell({
  children,
  platformRole,
  showWorkspaceLink = false,
  user,
}: React.PropsWithChildren<{
  platformRole: PlatformAdminRole;
  showWorkspaceLink?: boolean;
  user: JwtPayload;
}>) {
  return (
    <PlatformConsoleProvider
      value={{
        platformRole,
        showWorkspaceLink,
      }}
    >
      <div className="platform-console flex h-dvh overflow-hidden">
        <PlatformSidebar />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <PlatformMobileHeader />
          <PlatformHeader user={user} />
          <main className="platform-console-main">{children}</main>
        </div>
      </div>
    </PlatformConsoleProvider>
  );
}

'use client';

import type { PlatformAdminRole } from '~/lib/kinder/platform/types';

import { PlatformConsoleProvider } from './platform-context';
import { PlatformMobileHeader } from './platform-mobile-header';
import { PlatformSidebar } from './platform-sidebar';

export function PlatformShell({
  children,
  platformRole,
  showWorkspaceLink = false,
}: React.PropsWithChildren<{
  platformRole: PlatformAdminRole;
  showWorkspaceLink?: boolean;
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
          <main className="platform-console-main">{children}</main>
        </div>
      </div>
    </PlatformConsoleProvider>
  );
}

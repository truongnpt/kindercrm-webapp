'use client';

import { createContext, useContext } from 'react';

import type { PlatformAdminRole } from '~/lib/kinder/platform/types';

export type PlatformConsoleContextValue = {
  platformRole: PlatformAdminRole;
  showWorkspaceLink: boolean;
};

const PlatformConsoleContext = createContext<PlatformConsoleContextValue | null>(
  null,
);

export function PlatformConsoleProvider({
  value,
  children,
}: React.PropsWithChildren<{ value: PlatformConsoleContextValue }>) {
  return (
    <PlatformConsoleContext.Provider value={value}>
      {children}
    </PlatformConsoleContext.Provider>
  );
}

export function usePlatformConsole() {
  const context = useContext(PlatformConsoleContext);

  if (!context) {
    throw new Error('usePlatformConsole must be used within PlatformConsoleProvider');
  }

  return context;
}

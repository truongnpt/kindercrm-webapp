'use client';

import { createContext, useContext } from 'react';

import type { JwtPayload } from '@supabase/supabase-js';

import type { ParentChildSummary } from '~/lib/kinder/parent/types';
import type { UserNotification } from '~/lib/kinder/notifications/types';

export type ParentPortalContextValue = {
  user: JwtPayload;
  children: ParentChildSummary[];
  primaryChildId: string | null;
  notifications: UserNotification[];
  unreadCount: number;
  hasStaffAccess: boolean;
};

const ParentPortalContext = createContext<ParentPortalContextValue | null>(
  null,
);

export function ParentPortalProvider({
  value,
  children,
}: React.PropsWithChildren<{ value: ParentPortalContextValue }>) {
  return (
    <ParentPortalContext.Provider value={value}>
      {children}
    </ParentPortalContext.Provider>
  );
}

export function useParentPortal() {
  const context = useContext(ParentPortalContext);

  if (!context) {
    throw new Error('useParentPortal must be used within ParentPortalProvider');
  }

  return context;
}

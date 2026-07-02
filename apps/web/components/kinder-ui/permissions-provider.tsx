'use client';

import { createContext, useContext, useMemo } from 'react';

import type { KinderPermission } from '~/lib/kinder/permissions/permission-keys';
import { hasPermission } from '~/lib/kinder/permissions/check-permission';

const PermissionsContext = createContext<ReadonlySet<KinderPermission>>(
  new Set(),
);

export function PermissionsProvider({
  permissions,
  children,
}: React.PropsWithChildren<{
  permissions: readonly KinderPermission[];
}>) {
  const value = useMemo(
    () => new Set(permissions) as ReadonlySet<KinderPermission>,
    [permissions],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}

export function useHasPermission(permission: KinderPermission) {
  const permissions = usePermissions();

  return hasPermission(permissions, permission);
}

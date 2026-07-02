import {
  SYSTEM_CONFIGURABLE_ROLES,
  type ConfigurableRole,
} from './permission-keys';

export { SYSTEM_CONFIGURABLE_ROLES };

/** @deprecated Use SYSTEM_CONFIGURABLE_ROLES */
export const CONFIGURABLE_ROLES = SYSTEM_CONFIGURABLE_ROLES;

export type MatrixRole =
  | { kind: 'system'; role: ConfigurableRole }
  | { kind: 'custom'; id: string; name: string };

export function getMatrixRoleKey(role: MatrixRole): string {
  return role.kind === 'system' ? role.role : `custom:${role.id}`;
}

export function buildMatrixRoles(
  customRoles: Array<{ id: string; name: string }>,
): MatrixRole[] {
  return [
    ...SYSTEM_CONFIGURABLE_ROLES.map(
      (role) => ({ kind: 'system', role }) as const,
    ),
    ...customRoles.map(
      (customRole) =>
        ({
          kind: 'custom',
          id: customRole.id,
          name: customRole.name,
        }) as const,
    ),
  ];
}

export function parseAccessRoleKey(accessRoleKey: string): {
  accessRole: 'staff' | 'admin' | 'manager' | 'accountant';
  customRoleId: string | null;
} {
  if (accessRoleKey.startsWith('custom:')) {
    return {
      accessRole: 'staff',
      customRoleId: accessRoleKey.slice('custom:'.length),
    };
  }

  if (accessRoleKey === 'accountant') {
    return { accessRole: 'staff', customRoleId: null };
  }

  return {
    accessRole: accessRoleKey as 'staff' | 'admin' | 'manager',
    customRoleId: null,
  };
}

export function toAccessRoleKey(input: {
  accessRole: string;
  customRoleId?: string | null;
}): string {
  if (input.customRoleId) {
    return `custom:${input.customRoleId}`;
  }

  return input.accessRole;
}

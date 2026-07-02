'use client';

import { Fragment, useMemo, useState } from 'react';

import { ShieldCheck } from 'lucide-react';
import { Checkbox } from '@kit/ui/checkbox';
import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import {
  ALL_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  SYSTEM_CONFIGURABLE_ROLES,
  buildMatrixRoles,
  getMatrixRoleKey,
  type KinderPermission,
  type MatrixRole,
  type SchoolCustomRole,
  type SchoolRolePermissionRow,
  updateSchoolPermissionsAction,
} from '~/lib/kinder/permissions';

import { CustomRolesPanel } from './custom-roles-panel';

function resolveGranted(
  matrixRole: MatrixRole,
  permission: KinderPermission,
  rows: SchoolRolePermissionRow[],
) {
  const roleKey = getMatrixRoleKey(matrixRole);
  const match = rows.find(
    (row) => row.roleKey === roleKey && row.permission === permission,
  );

  if (match) {
    return match.granted;
  }

  if (matrixRole.kind === 'system') {
    return DEFAULT_ROLE_PERMISSIONS[matrixRole.role].includes(permission);
  }

  return false;
}

export function StaffPermissionsPanel({
  schoolId,
  rows,
  customRoles,
}: {
  schoolId: string;
  rows: SchoolRolePermissionRow[];
  customRoles: SchoolCustomRole[];
}) {
  const matrixRoles = useMemo(
    () => buildMatrixRoles(customRoles),
    [customRoles],
  );

  const [draft, setDraft] = useState(() => {
    const map = new Map<string, boolean>();

    for (const matrixRole of matrixRoles) {
      for (const permission of ALL_PERMISSIONS) {
        map.set(
          `${getMatrixRoleKey(matrixRole)}:${permission}`,
          resolveGranted(matrixRole, permission, rows),
        );
      }
    }

    return map;
  });

  const savePermissions = useKinderMutation({
    mutationFn: updateSchoolPermissionsAction,
    invalidateKeys: [kinderQueryKeys.staff.all(schoolId)],
  });

  const grants = useMemo(
    () =>
      matrixRoles.flatMap((matrixRole) =>
        ALL_PERMISSIONS.map((permission) => ({
          role:
            matrixRole.kind === 'system' ? matrixRole.role : undefined,
          customRoleId:
            matrixRole.kind === 'custom' ? matrixRole.id : undefined,
          permission,
          granted:
            draft.get(`${getMatrixRoleKey(matrixRole)}:${permission}`) ??
            false,
        })),
      ),
    [draft, matrixRoles],
  );

  const toggle = (
    matrixRole: MatrixRole,
    permission: KinderPermission,
    granted: boolean,
  ) => {
    setDraft((current) => {
      const next = new Map(current);
      next.set(`${getMatrixRoleKey(matrixRole)}:${permission}`, granted);
      return next;
    });
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:permissions.description" />}
          title={
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="text-primary size-5" />
              <Trans i18nKey="kinder:permissions.title" />
            </span>
          }
        />

        <KinderSubmitButton
          className="shrink-0 rounded-full"
          loading={savePermissions.isPending}
          onClick={() => savePermissions.mutate({ schoolId, grants })}
          type="button"
        >
          <Trans i18nKey="kinder:permissions.save" />
        </KinderSubmitButton>
      </div>

      <CustomRolesPanel customRoles={customRoles} schoolId={schoolId} />

      <div className="overflow-x-auto px-5 py-5 sm:px-6 sm:py-6">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-3 text-left font-medium text-muted-foreground">
                <Trans i18nKey="kinder:permissions.permissionColumn" />
              </th>
              {matrixRoles.map((matrixRole) => (
                <th
                  className="px-3 py-3 text-center font-medium text-muted-foreground"
                  key={getMatrixRoleKey(matrixRole)}
                >
                  {matrixRole.kind === 'system' ? (
                    <Trans
                      i18nKey={`kinder:permissions.roles.${matrixRole.role}`}
                    />
                  ) : (
                    matrixRole.name
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group) => (
              <Fragment key={group.id}>
                <tr className="bg-muted/30">
                  <td
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    colSpan={matrixRoles.length + 1}
                  >
                    <Trans i18nKey={group.labelKey} />
                  </td>
                </tr>
                {group.permissions.map((permission) => (
                  <tr
                    className="border-b border-border/70"
                    key={permission.key}
                  >
                    <td className="px-3 py-3 font-medium">
                      <Trans i18nKey={permission.labelKey} />
                    </td>
                    {matrixRoles.map((matrixRole) => {
                      const roleKey = getMatrixRoleKey(matrixRole);
                      const checked =
                        draft.get(`${roleKey}:${permission.key}`) ?? false;

                      return (
                        <td className="px-3 py-3 text-center" key={roleKey}>
                          <Checkbox
                            aria-label={`${roleKey} ${permission.key}`}
                            checked={checked}
                            onCheckedChange={(value) =>
                              toggle(matrixRole, permission.key, value === true)
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>

        <p className="text-muted-foreground mt-4 text-xs">
          <Trans i18nKey="kinder:permissions.ownerNote" />
        </p>
      </div>
    </BentoTile>
  );
}

import { z } from 'zod';

import {
  ALL_PERMISSIONS,
  SYSTEM_CONFIGURABLE_ROLES,
  type KinderPermission,
} from '../permission-keys';

const permissionEnum = ALL_PERMISSIONS as [
  KinderPermission,
  ...KinderPermission[],
];

const PermissionGrantSchema = z
  .object({
    role: z.enum(SYSTEM_CONFIGURABLE_ROLES).optional(),
    customRoleId: z.string().uuid().optional(),
    permission: z.enum(permissionEnum),
    granted: z.boolean(),
  })
  .refine(
    (value) => Boolean(value.role) !== Boolean(value.customRoleId),
    'Grant must target either a system role or a custom role',
  );

export const UpdateSchoolPermissionsSchema = z.object({
  schoolId: z.string().uuid(),
  grants: z.array(PermissionGrantSchema).min(1),
});

export type UpdateSchoolPermissionsInput = z.infer<
  typeof UpdateSchoolPermissionsSchema
>;

export const CreateSchoolCustomRoleSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().max(500).optional().or(z.literal('')),
});

export const DeleteSchoolCustomRoleSchema = z.object({
  schoolId: z.string().uuid(),
  customRoleId: z.string().uuid(),
});

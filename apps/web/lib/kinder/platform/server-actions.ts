'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getPlatformDataClient } from '~/lib/kinder/platform/platform-data-client';

import pathsConfig from '~/config/paths.config';
import { assertPlatformRole } from '~/lib/kinder/platform/require-platform-admin';
import { logPlatformAction } from '~/lib/kinder/platform/audit';
import { PlatformSchoolActionSchema } from '~/lib/kinder/platform/schemas/platform.schema';
import {
  requirePlatformAdmin,
} from '~/lib/kinder/platform/require-platform-admin';

function revalidatePlatformSchoolPaths() {
  revalidatePath(pathsConfig.platform.home);
  revalidatePath(pathsConfig.platform.schools);
  revalidatePath(pathsConfig.platform.packages);
  revalidatePath(pathsConfig.platform.admins);
  revalidatePath(pathsConfig.platform.auditLogs);
}

export const platformSuspendSchoolAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, ['super_admin', 'support']);
    assertPlatformRole(platform, ['super_admin', 'support']);

    const client = getPlatformDataClient();

    const { error } = await client
      .from('schools')
      .update({ status: 'suspended' })
      .eq('id', data.schoolId);

    if (error) {
      throw error;
    }

    await logPlatformAction({
      actorUserId: user.sub,
      action: 'school.suspend',
      targetType: 'school',
      targetId: data.schoolId,
    });

    revalidatePlatformSchoolPaths();
    revalidatePath(`${pathsConfig.platform.schoolDetail}/${data.schoolId}`);

    return { success: true };
  },
  { schema: PlatformSchoolActionSchema },
);

export const platformRestoreSchoolAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, ['super_admin', 'support']);
    assertPlatformRole(platform, ['super_admin', 'support']);

    const client = getPlatformDataClient();

    const { error } = await client
      .from('schools')
      .update({ status: 'active' })
      .eq('id', data.schoolId);

    if (error) {
      throw error;
    }

    await logPlatformAction({
      actorUserId: user.sub,
      action: 'school.restore',
      targetType: 'school',
      targetId: data.schoolId,
    });

    revalidatePlatformSchoolPaths();
    revalidatePath(`${pathsConfig.platform.schoolDetail}/${data.schoolId}`);

    return { success: true };
  },
  { schema: PlatformSchoolActionSchema },
);

export const platformArchiveSchoolAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, ['super_admin']);
    assertPlatformRole(platform, ['super_admin']);

    const client = getPlatformDataClient();

    const { error } = await client
      .from('schools')
      .update({
        status: 'archived',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', data.schoolId);

    if (error) {
      throw error;
    }

    await logPlatformAction({
      actorUserId: user.sub,
      action: 'school.archive',
      targetType: 'school',
      targetId: data.schoolId,
    });

    revalidatePlatformSchoolPaths();
    revalidatePath(`${pathsConfig.platform.schoolDetail}/${data.schoolId}`);

    return { success: true };
  },
  { schema: PlatformSchoolActionSchema },
);

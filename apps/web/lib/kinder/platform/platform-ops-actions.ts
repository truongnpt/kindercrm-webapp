'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getPlatformDataClient } from './platform-data-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import type { Json } from '~/lib/database.types';

import { logPlatformAction } from './audit';
import {
  assertPlatformRole,
  requirePlatformAdmin,
} from './require-platform-admin';
import {
  CreatePackageSchema,
  GrantPlatformAdminSchema,
  PlatformOverrideSubscriptionSchema,
  RevokePlatformAdminSchema,
  UpdatePackageSchema,
} from './schemas/package.schema';

function revalidatePlatformPaths() {
  revalidatePath(pathsConfig.platform.home);
  revalidatePath(pathsConfig.platform.schools);
  revalidatePath(pathsConfig.platform.packages);
  revalidatePath(pathsConfig.platform.admins);
  revalidatePath(pathsConfig.platform.auditLogs);
}

function buildFeatures(data: {
  featuresAll: boolean;
  features: Record<string, boolean>;
}) {
  if (data.featuresAll) {
    return { all: true } as Json;
  }

  return data.features as Json;
}

export const platformCreatePackageAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, ['super_admin', 'billing']);
    assertPlatformRole(platform, ['super_admin', 'billing']);

    const client = getPlatformDataClient();

    const { data: existing } = await client
      .from('packages')
      .select('id')
      .eq('code', data.code)
      .maybeSingle();

    if (existing) {
      throw new KinderError(
        KINDER_ERROR_CODES.PACKAGE_NOT_FOUND,
        'Package code already exists',
      );
    }

    const { data: pkg, error } = await client
      .from('packages')
      .insert({
        code: data.code,
        name: data.name,
        description: data.description || null,
        max_students: data.maxStudents,
        max_campuses: data.maxCampuses,
        max_storage_mb: data.maxStorageMb,
        ai_credits_monthly: data.aiCreditsMonthly,
        price_monthly: data.priceMonthly,
        sort_order: data.sortOrder,
        is_active: data.isActive,
        features: buildFeatures(data),
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    await logPlatformAction({
      actorUserId: user.sub,
      action: 'package.create',
      targetType: 'package',
      targetId: pkg?.id,
      metadata: { code: data.code },
    });

    revalidatePlatformPaths();
    return { success: true };
  },
  { schema: CreatePackageSchema },
);

export const platformUpdatePackageAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, ['super_admin', 'billing']);
    assertPlatformRole(platform, ['super_admin', 'billing']);

    const client = getPlatformDataClient();

    const { error } = await client
      .from('packages')
      .update({
        name: data.name,
        description: data.description || null,
        max_students: data.maxStudents,
        max_campuses: data.maxCampuses,
        max_storage_mb: data.maxStorageMb,
        ai_credits_monthly: data.aiCreditsMonthly,
        price_monthly: data.priceMonthly,
        sort_order: data.sortOrder,
        is_active: data.isActive,
        features: buildFeatures(data),
      })
      .eq('id', data.packageId);

    if (error) {
      throw error;
    }

    await logPlatformAction({
      actorUserId: user.sub,
      action: 'package.update',
      targetType: 'package',
      targetId: data.packageId,
    });

    revalidatePlatformPaths();
    return { success: true };
  },
  { schema: UpdatePackageSchema },
);

export const platformOverrideSubscriptionAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, [
      'super_admin',
      'support',
      'billing',
    ]);
    assertPlatformRole(platform, ['super_admin', 'support', 'billing']);

    const client = getPlatformDataClient();

    const { data: targetPackage, error: packageError } = await client
      .from('packages')
      .select('id, code')
      .eq('id', data.packageId)
      .single();

    if (packageError || !targetPackage) {
      throw new KinderError(
        KINDER_ERROR_CODES.PACKAGE_NOT_FOUND,
        'Package not found',
      );
    }

    const { data: currentSub, error: subError } = await client
      .from('school_subscriptions')
      .select('id, package_id, status')
      .eq('school_id', data.schoolId)
      .maybeSingle();

    if (subError) {
      throw subError;
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const trialEndsAt =
      data.status === 'trial' && data.trialEndsAt
        ? new Date(data.trialEndsAt).toISOString()
        : data.status === 'trial'
          ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : null;

    if (currentSub) {
      const { error: updateError } = await client
        .from('school_subscriptions')
        .update({
          package_id: data.packageId,
          status: data.status,
          trial_ends_at: trialEndsAt,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .eq('school_id', data.schoolId);

      if (updateError) {
        throw updateError;
      }
    } else {
      const { error: insertError } = await client
        .from('school_subscriptions')
        .insert({
          school_id: data.schoolId,
          package_id: data.packageId,
          status: data.status,
          trial_ends_at: trialEndsAt,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });

      if (insertError) {
        throw insertError;
      }
    }

    await client.from('school_subscription_history').insert({
      school_id: data.schoolId,
      package_id: data.packageId,
      previous_package_id: currentSub?.package_id ?? null,
      status: data.status,
      changed_by: user.sub,
      note: data.note || `Platform override to ${targetPackage.code}`,
    });

    await logPlatformAction({
      actorUserId: user.sub,
      action: 'subscription.override',
      targetType: 'school',
      targetId: data.schoolId,
      metadata: {
        packageId: data.packageId,
        status: data.status,
      },
    });

    revalidatePlatformPaths();
    revalidatePath(`${pathsConfig.platform.schoolDetail}/${data.schoolId}`);
    revalidatePath(pathsConfig.app.settingsSubscription);

    return { success: true };
  },
  { schema: PlatformOverrideSubscriptionSchema },
);

export const platformGrantAdminAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, ['super_admin']);
    assertPlatformRole(platform, ['super_admin']);

    const client = getPlatformDataClient();

    const { data: account, error: accountError } = await client
      .from('accounts')
      .select('id, email')
      .ilike('email', data.email)
      .maybeSingle();

    if (accountError || !account) {
      throw new KinderError(
        KINDER_ERROR_CODES.PARENT_ACCOUNT_NOT_FOUND,
        'User account not found for this email',
      );
    }

    const { data: existing } = await client
      .from('platform_admins')
      .select('id')
      .eq('user_id', account.id)
      .maybeSingle();

    if (existing) {
      const { error } = await client
        .from('platform_admins')
        .update({
          role: data.role,
          is_active: true,
          revoked_at: null,
          granted_by: user.sub,
          notes: data.notes || null,
        })
        .eq('id', existing.id);

      if (error) {
        throw error;
      }
    } else {
      const { error } = await client.from('platform_admins').insert({
        user_id: account.id,
        role: data.role,
        granted_by: user.sub,
        notes: data.notes || null,
      });

      if (error) {
        throw error;
      }
    }

    await logPlatformAction({
      actorUserId: user.sub,
      action: 'platform_admin.grant',
      targetType: 'user',
      targetId: account.id,
      metadata: { role: data.role, email: account.email },
    });

    revalidatePlatformPaths();
    return { success: true };
  },
  { schema: GrantPlatformAdminSchema },
);

export const platformRevokeAdminAction = enhanceAction(
  async (data, user) => {
    const platform = await requirePlatformAdmin(user.sub, ['super_admin']);
    assertPlatformRole(platform, ['super_admin']);

    const client = getPlatformDataClient();

    const { data: target, error: targetError } = await client
      .from('platform_admins')
      .select('id, user_id')
      .eq('id', data.platformAdminId)
      .maybeSingle();

    if (targetError || !target) {
      throw new Error('Platform admin not found');
    }

    if (target.user_id === user.sub) {
      throw new Error('Cannot revoke your own platform admin access');
    }

    const { error } = await client
      .from('platform_admins')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', data.platformAdminId);

    if (error) {
      throw error;
    }

    await logPlatformAction({
      actorUserId: user.sub,
      action: 'platform_admin.revoke',
      targetType: 'user',
      targetId: target.user_id,
    });

    revalidatePlatformPaths();
    return { success: true };
  },
  { schema: RevokePlatformAdminSchema },
);

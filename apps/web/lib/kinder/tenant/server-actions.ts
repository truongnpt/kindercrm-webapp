'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import { assertCampusQuota } from '~/lib/kinder/subscription/quotas';
import type { Package } from '~/lib/kinder/types';

import { setActiveSchoolIdCookie } from './active-school-cookie';
import { CreateCampusSchema } from './schemas/campus.schema';
import {
  CreateSchoolSchema,
  SwitchSchoolSchema,
  UpdateSchoolSchema,
} from './schemas/school.schema';

const APP_PATH = pathsConfig.app.home;

function revalidateSchoolPaths() {
  revalidatePath(APP_PATH);
  revalidatePath(`${APP_PATH}/settings/school`);
  revalidatePath(`${APP_PATH}/settings/campuses`);
  revalidatePath(pathsConfig.app.settingsSubscription);
}

/** TENANT-001: Create School */
export const createSchoolAction = enhanceAction(
  async (data, _user) => {
    const client = getSupabaseServerClient();

    const { data: schoolId, error } = await client.rpc('create_school_for_owner', {
      p_name: data.name,
      p_slug: data.slug,
      p_phone: data.phone || null,
      p_email: data.email || null,
      p_address: data.address || null,
      p_campus_name: data.campusName,
    });

    if (error) {
      const message = error.message ?? '';

      if (message.includes('SCHOOL_SLUG_TAKEN')) {
        throw new KinderError(
          KINDER_ERROR_CODES.SCHOOL_SLUG_TAKEN,
          'School slug already exists',
        );
      }

      if (message.includes('PACKAGE_NOT_FOUND')) {
        throw new KinderError(
          KINDER_ERROR_CODES.PACKAGE_NOT_FOUND,
          'Subscription package is not configured',
        );
      }

      throw error;
    }

    if (!schoolId) {
      throw new Error('Failed to create school');
    }

    await setActiveSchoolIdCookie(schoolId);
    revalidateSchoolPaths();

    redirect(APP_PATH);
  },
  { schema: CreateSchoolSchema },
);

/** TENANT-002: Update School */
export const updateSchoolAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('schools')
      .update({
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        logo_url: data.logoUrl || null,
        theme_primary_color: data.themePrimaryColor || null,
        custom_domain: data.customDomain || null,
      })
      .eq('id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateSchoolPaths();
    return { success: true };
  },
  { schema: UpdateSchoolSchema },
);

/** TENANT-003: Suspend School */
export const suspendSchoolAction = enhanceAction(
  async ({ schoolId }: { schoolId: string }) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('schools')
      .update({ status: 'suspended' })
      .eq('id', schoolId);

    if (error) {
      throw error;
    }

    revalidateSchoolPaths();
    return { success: true };
  },
  {
    schema: SwitchSchoolSchema,
  },
);

/** TENANT-004: Archive (soft delete) School */
export const archiveSchoolAction = enhanceAction(
  async ({ schoolId }: { schoolId: string }) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('schools')
      .update({
        status: 'archived',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', schoolId);

    if (error) {
      throw error;
    }

    revalidateSchoolPaths();
    redirect(pathsConfig.app.onboarding);
  },
  { schema: SwitchSchoolSchema },
);

export const switchSchoolAction = enhanceAction(
  async (data) => {
    await setActiveSchoolIdCookie(data.schoolId);
    revalidateSchoolPaths();
    redirect(APP_PATH);
  },
  { schema: SwitchSchoolSchema },
);

/** TENANT-008 / TENANT-009: Create campus or branch */
export const createCampusAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: subscription } = await client
      .from('school_subscriptions')
      .select('package:packages (*)')
      .eq('school_id', data.schoolId)
      .maybeSingle();

    await assertCampusQuota(
      client,
      data.schoolId,
      (subscription?.package as Package | null) ?? null,
    );

    if (data.isMain) {
      await client
        .from('campuses')
        .update({ is_main: false })
        .eq('school_id', data.schoolId);
    }

    const { error } = await client.from('campuses').insert({
      school_id: data.schoolId,
      name: data.name,
      campus_type: data.campusType,
      parent_campus_id: data.parentCampusId || null,
      address: data.address || null,
      phone: data.phone || null,
      is_main: data.isMain,
    });

    if (error) {
      throw error;
    }

    revalidateSchoolPaths();
    return { success: true };
  },
  { schema: CreateCampusSchema },
);

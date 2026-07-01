'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import { seedDefaultLeadSources } from '~/lib/kinder/crm/seed-lead-sources';
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
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: existing } = await client
      .from('schools')
      .select('id')
      .eq('slug', data.slug)
      .maybeSingle();

    if (existing) {
      throw new KinderError(
        KINDER_ERROR_CODES.SCHOOL_SLUG_TAKEN,
        'School slug already exists',
      );
    }

    const { data: school, error: schoolError } = await client
      .from('schools')
      .insert({
        name: data.name,
        slug: data.slug,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
      })
      .select('id')
      .single();

    if (schoolError || !school) {
      throw schoolError ?? new Error('Failed to create school');
    }

    const { error: memberError } = await client.from('school_members').insert({
      school_id: school.id,
      user_id: user.id,
      role: 'owner',
    });

    if (memberError) {
      throw memberError;
    }

    const { error: campusError } = await client.from('campuses').insert({
      school_id: school.id,
      name: data.campusName,
      is_main: true,
      campus_type: 'campus',
    });

    if (campusError) {
      throw campusError;
    }

    const { data: freePackage } = await client
      .from('packages')
      .select('id')
      .eq('code', 'free')
      .single();

    if (freePackage) {
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 14);

      await client.from('school_subscriptions').insert({
        school_id: school.id,
        package_id: freePackage.id,
        status: 'trial',
        trial_ends_at: trialEnds.toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: trialEnds.toISOString(),
      });

      await client.from('school_subscription_history').insert({
        school_id: school.id,
        package_id: freePackage.id,
        status: 'trial',
        changed_by: user.id,
        note: 'Initial trial subscription',
      });
    }

    await seedDefaultLeadSources(client, school.id);

    await setActiveSchoolIdCookie(school.id);
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

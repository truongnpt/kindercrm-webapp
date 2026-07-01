'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import { ChangePackageSchema } from './schemas/change-package.schema';

const SUBSCRIPTION_PATH = pathsConfig.app.settingsSubscription;

function revalidateSubscriptionPaths() {
  revalidatePath(pathsConfig.app.home);
  revalidatePath(SUBSCRIPTION_PATH);
}

/** PACKAGE-003: Change subscription package (MVP — no payment gateway) */
export const changePackageAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: targetPackage, error: packageError } = await client
      .from('packages')
      .select('id, code')
      .eq('id', data.packageId)
      .eq('is_active', true)
      .single();

    if (packageError || !targetPackage) {
      throw new KinderError(
        KINDER_ERROR_CODES.PACKAGE_NOT_FOUND,
        'Package not found',
      );
    }

    if (targetPackage.code === 'enterprise') {
      throw new KinderError(
        KINDER_ERROR_CODES.PACKAGE_NOT_AVAILABLE,
        'Contact sales for Enterprise plan',
      );
    }

    const { data: currentSub, error: subError } = await client
      .from('school_subscriptions')
      .select('id, package_id, status')
      .eq('school_id', data.schoolId)
      .single();

    if (subError || !currentSub) {
      throw subError ?? new Error('Subscription not found');
    }

    if (currentSub.package_id === data.packageId) {
      return { success: true, unchanged: true };
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { error: updateError } = await client
      .from('school_subscriptions')
      .update({
        package_id: data.packageId,
        status: 'active',
        trial_ends_at: null,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .eq('school_id', data.schoolId);

    if (updateError) {
      throw updateError;
    }

    await client.from('school_subscription_history').insert({
      school_id: data.schoolId,
      package_id: data.packageId,
      previous_package_id: currentSub.package_id,
      status: 'active',
      changed_by: user.id,
      note: data.note || `Changed to ${targetPackage.code}`,
    });

    revalidateSubscriptionPaths();
    return { success: true };
  },
  { schema: ChangePackageSchema },
);

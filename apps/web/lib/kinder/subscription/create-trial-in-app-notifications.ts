import 'server-only';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import pathsConfig from '~/config/paths.config';
import { createUserNotification } from '~/lib/kinder/notifications/load-notifications';

import { getTrialReminderKindForToday } from './package-features';
import {
  loadActiveTrialSubscriptions,
  loadSchoolOwner,
  TRIAL_IN_APP_COPY,
  trialReminderReferenceType,
} from './trial-reminder-shared';

async function wasInAppReminderSent(input: {
  schoolId: string;
  userId: string;
  referenceType: string;
}) {
  const client = getSupabaseServerAdminClient();

  const { data, error } = await client
    .from('user_notifications')
    .select('id')
    .eq('school_id', input.schoolId)
    .eq('user_id', input.userId)
    .eq('reference_type', input.referenceType)
    .eq('reference_id', input.schoolId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

/** SUB-008: Create in-app notifications for trial reminders (owner). */
export async function createTrialInAppNotifications() {
  const trials = await loadActiveTrialSubscriptions();
  const subscriptionPath = pathsConfig.app.settingsSubscription;

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of trials) {
    const kind = getTrialReminderKindForToday({
      status: 'trial',
      trial_ends_at: row.trial_ends_at,
    });

    if (!kind) {
      skipped += 1;
      continue;
    }

    const owner = await loadSchoolOwner(row.school_id);

    if (!owner) {
      skipped += 1;
      continue;
    }

    const referenceType = trialReminderReferenceType(kind);

    if (
      await wasInAppReminderSent({
        schoolId: row.school_id,
        userId: owner.userId,
        referenceType,
      })
    ) {
      skipped += 1;
      continue;
    }

    const copy = TRIAL_IN_APP_COPY[kind];

    try {
      await createUserNotification({
        schoolId: row.school_id,
        userId: owner.userId,
        category: 'subscription',
        title: copy.title,
        body: copy.body,
        linkUrl: subscriptionPath,
        referenceType,
        referenceId: row.school_id,
      });

      created += 1;
    } catch (notificationError) {
      errors += 1;
      console.error(
        `[trial-notification] failed school=${row.school_id} kind=${kind}`,
        notificationError,
      );
    }
  }

  return { created, skipped, errors };
}

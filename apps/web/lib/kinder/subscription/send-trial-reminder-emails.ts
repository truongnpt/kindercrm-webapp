import 'server-only';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { isSmtpConfigured } from '~/lib/kinder/mail/smtp-config';
import { sendMail } from '~/lib/kinder/mail/send-mail';

import { getTrialReminderKindForToday, type TrialReminderKind } from './package-features';
import {
  loadActiveTrialSubscriptions,
  loadSchoolOwner,
} from './trial-reminder-shared';
import { buildTrialReminderEmail } from './trial-reminder-email';

async function wasEmailReminderSent(schoolId: string, kind: TrialReminderKind) {
  const client = getSupabaseServerAdminClient();

  const { data, error } = await client
    .from('trial_email_reminders')
    .select('id')
    .eq('school_id', schoolId)
    .eq('reminder_kind', kind)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function recordEmailReminderSent(input: {
  schoolId: string;
  kind: TrialReminderKind;
  recipientEmail: string;
}) {
  const client = getSupabaseServerAdminClient();

  const { error } = await client.from('trial_email_reminders').insert({
    school_id: input.schoolId,
    reminder_kind: input.kind,
    recipient_email: input.recipientEmail,
  });

  if (error?.code === '23505') {
    return false;
  }

  if (error) {
    throw error;
  }

  return true;
}

/** SUB-007: Send T-7 / T-3 / T-1 / expiry-day emails to school owners. */
export async function sendTrialReminderEmails() {
  if (!isSmtpConfigured()) {
    return {
      sent: 0,
      skipped: 0,
      errors: 0,
      smtpConfigured: false,
    };
  }

  const trials = await loadActiveTrialSubscriptions();

  let sent = 0;
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

    if (await wasEmailReminderSent(row.school_id, kind)) {
      skipped += 1;
      continue;
    }

    const owner = await loadSchoolOwner(row.school_id);

    if (!owner?.email) {
      skipped += 1;
      continue;
    }

    const schoolName = row.school?.name ?? 'Trường của bạn';

    try {
      const email = buildTrialReminderEmail({
        schoolName,
        ownerName: owner.name,
        trialEndsAt: row.trial_ends_at,
        kind,
      });

      await sendMail({
        to: owner.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });

      await recordEmailReminderSent({
        schoolId: row.school_id,
        kind,
        recipientEmail: owner.email,
      });

      sent += 1;
    } catch (sendError) {
      errors += 1;
      console.error(
        `[trial-reminder] failed school=${row.school_id} kind=${kind}`,
        sendError,
      );
    }
  }

  return {
    sent,
    skipped,
    errors,
    smtpConfigured: true,
  };
}

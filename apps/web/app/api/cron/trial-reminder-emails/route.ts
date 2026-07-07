import { NextResponse } from 'next/server';

import { verifyCronAuth } from '~/lib/kinder/cron/verify-cron-auth';
import { createTrialInAppNotifications } from '~/lib/kinder/subscription/create-trial-in-app-notifications';
import { sendTrialReminderEmails } from '~/lib/kinder/subscription/send-trial-reminder-emails';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured' },
      { status: 500 },
    );
  }

  try {
    const [emailResult, notificationResult] = await Promise.all([
      sendTrialReminderEmails(),
      createTrialInAppNotifications(),
    ]);

    return NextResponse.json({
      ok: true,
      email: emailResult,
      notifications: notificationResult,
    });
  } catch (error) {
    console.error('[cron.trial-reminder-emails] failed', error);
    return NextResponse.json(
      { error: 'Failed to send trial reminder emails' },
      { status: 500 },
    );
  }
}

import { NextResponse } from 'next/server';

import { revalidatePath } from 'next/cache';

import pathsConfig from '~/config/paths.config';
import { verifyCronAuth } from '~/lib/kinder/cron/verify-cron-auth';
import { expireTrialSubscriptions } from '~/lib/kinder/subscription/expire-trial-subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function revalidateExpiredSchools(schoolIds: string[]) {
  revalidatePath(pathsConfig.app.home);
  revalidatePath(pathsConfig.app.settingsSubscription);

  for (const schoolId of schoolIds) {
    revalidatePath(`${pathsConfig.platform.schoolDetail}/${schoolId}`);
  }
}

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
    const result = await expireTrialSubscriptions();

    if (result.processed > 0) {
      revalidateExpiredSchools(result.schoolIds);
    }

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      schoolIds: result.schoolIds,
    });
  } catch (error) {
    console.error('[cron.expire-trials] failed', error);
    return NextResponse.json(
      { error: 'Failed to expire trial subscriptions' },
      { status: 500 },
    );
  }
}

import 'server-only';

import { revalidatePath } from 'next/cache';

import pathsConfig from '~/config/paths.config';

const SUBSCRIPTION_PATH = pathsConfig.app.settingsSubscription;

export function revalidateSubscriptionBillingPaths(schoolId?: string) {
  revalidatePath(pathsConfig.app.home);
  revalidatePath(SUBSCRIPTION_PATH);

  if (schoolId) {
    revalidatePath(`${pathsConfig.platform.schoolDetail}/${schoolId}`);
  }
}

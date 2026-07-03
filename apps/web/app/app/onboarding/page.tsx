import { redirect } from 'next/navigation';

import pathsConfig from '~/config/paths.config';
import { redirectIfPlatformAdmin } from '~/lib/kinder/platform/require-platform-admin';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateSchoolForm } from './_components/create-school-form';
import { OnboardingShell } from './_components/onboarding-shell';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:onboarding.title'),
  };
};

async function OnboardingPage() {
  const user = await requireUserInServerComponent();
  await redirectIfPlatformAdmin(user.id);

  const context = await getSchoolContext(user.id);

  if (context) {
    redirect(pathsConfig.app.home);
  }

  const email =
    typeof user.email === 'string' ? user.email : undefined;

  return (
    <OnboardingShell>
      <CreateSchoolForm defaultEmail={email} />
    </OnboardingShell>
  );
}

export default withI18n(OnboardingPage);

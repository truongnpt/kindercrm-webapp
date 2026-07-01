import { redirect } from 'next/navigation';

import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { OnboardingShell } from '../_components/coming-soon-panel';
import { CreateSchoolForm } from './_components/create-school-form';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:onboarding.title'),
  };
};

async function OnboardingPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (context) {
    redirect(pathsConfig.app.home);
  }

  return (
    <OnboardingShell>
      <Heading level={4}>
        <Trans i18nKey="kinder:onboarding.title" />
      </Heading>

      <p className="text-muted-foreground mb-6 text-sm">
        <Trans i18nKey="kinder:onboarding.description" />
      </p>

      <CreateSchoolForm />
    </OnboardingShell>
  );
}

export default withI18n(OnboardingPage);

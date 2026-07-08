import { UpdatePasswordForm } from '@kit/auth/password-reset';

import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('auth:updatePassword'),
  };
};

interface UpdatePasswordPageProps {
  searchParams: Promise<{
    callback?: string;
  }>;
}

async function UpdatePasswordPage(props: UpdatePasswordPageProps) {
  await requireUserInServerComponent();

  const { callback } = await props.searchParams;
  const redirectTo = callback ?? pathsConfig.app.home;

  return <UpdatePasswordForm redirectTo={redirectTo} />;
}

export default withI18n(UpdatePasswordPage);

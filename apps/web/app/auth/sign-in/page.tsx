import { SignInMethodsContainer } from '@kit/auth/sign-in';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signIn'),
  };
};

const paths = {
  callback: pathsConfig.auth.callback,
  home: pathsConfig.auth.postLogin,
};

function SignInPage() {
  return (
    <SignInMethodsContainer paths={paths} providers={authConfig.providers} />
  );
}

export default withI18n(SignInPage);

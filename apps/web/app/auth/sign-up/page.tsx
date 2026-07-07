import { SignUpMethodsContainer } from '@kit/auth/sign-up';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signUp'),
  };
};

const paths = {
  callback: pathsConfig.auth.callback,
  appHome: pathsConfig.auth.postLogin,
};

function SignUpPage() {
  return (
    <SignUpMethodsContainer
      providers={authConfig.providers}
      displayTermsCheckbox={authConfig.displayTermsCheckbox}
      paths={paths}
    />
  );
}

export default withI18n(SignUpPage);

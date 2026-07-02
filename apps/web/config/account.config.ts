import pathsConfig from '~/config/paths.config';

export const personalAccountSettingsFeatures = {
  enablePasswordUpdate: true,
  enableAccountDeletion:
    process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION === 'true',
};

export const personalAccountSettingsPaths = {
  callback: pathsConfig.auth.callback,
};

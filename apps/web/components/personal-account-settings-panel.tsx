'use client';

import { PersonalAccountSettingsContainer } from '@kit/accounts/personal-account-settings';

import {
  personalAccountSettingsFeatures,
  personalAccountSettingsPaths,
} from '~/config/account.config';

export function PersonalAccountSettingsPanel({ userId }: { userId: string }) {
  return (
    <PersonalAccountSettingsContainer
      features={personalAccountSettingsFeatures}
      paths={personalAccountSettingsPaths}
      userId={userId}
    />
  );
}

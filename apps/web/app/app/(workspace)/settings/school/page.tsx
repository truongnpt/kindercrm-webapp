import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { UpdateSchoolForm } from './_components/update-school-form';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:schoolSettings.title'),
  };
};

async function SchoolSettingsPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  return (
    <>
      <PageHeader
        description={<Trans i18nKey="kinder:schoolSettings.description" />}
        title={<Trans i18nKey="kinder:schoolSettings.title" />}
      />

      <PageBody>
        <UpdateSchoolForm school={context.school} />
      </PageBody>
    </>
  );
}

export default withI18n(SchoolSettingsPage);

import { Trans } from '@kit/ui/trans';

import { PlatformPageBody, PlatformPageHeader } from '~/components/platform-console';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadPlatformSchools } from '~/lib/kinder/platform/load-platform-schools';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { PlatformSchoolsFilter } from './_components/platform-schools-filter';
import { PlatformSchoolsTable } from './_components/platform-schools-table';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:platform.schools.title'),
  };
};

async function PlatformSchoolsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const user = await requireUserInServerComponent();
  const platform = await requirePlatformAdminPage(user.id, [
    'super_admin',
    'support',
  ]);
  const schools = await loadPlatformSchools({ status, search: q });

  return (
    <>
      <PlatformPageHeader
        description={<Trans i18nKey="kinder:platform.schools.description" />}
        title={<Trans i18nKey="kinder:platform.schools.title" />}
      />

      <PlatformPageBody>
        <PlatformSchoolsFilter defaultQuery={q} defaultStatus={status} />
        <PlatformSchoolsTable platformRole={platform.role} schools={schools} />
      </PlatformPageBody>
    </>
  );
}

export default withI18n(PlatformSchoolsPage);

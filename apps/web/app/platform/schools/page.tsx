import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { loadPlatformSchools } from '~/lib/kinder/platform/load-platform-schools';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

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
      <KinderPageHeader
        description={<Trans i18nKey="kinder:platform.schools.description" />}
        title={<Trans i18nKey="kinder:platform.schools.title" />}
      />

      <KinderPageBody>
        <form className="flex flex-wrap gap-2">
          <input
            className="border-input bg-background h-10 min-w-[200px] flex-1 rounded-xl border px-3 text-sm"
            defaultValue={q ?? ''}
            name="q"
            placeholder="Search..."
            type="search"
          />
          <select
            className="border-input bg-background h-10 rounded-xl border px-3 text-sm"
            defaultValue={status ?? 'all'}
            name="status"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="archived">Archived</option>
          </select>
          <button
            className="bg-primary text-primary-foreground h-10 rounded-xl px-4 text-sm font-medium"
            type="submit"
          >
            <Trans i18nKey="kinder:platform.schools.filter" />
          </button>
        </form>

        <PlatformSchoolsTable platformRole={platform.role} schools={schools} />
      </KinderPageBody>
    </>
  );
}

export default withI18n(PlatformSchoolsPage);

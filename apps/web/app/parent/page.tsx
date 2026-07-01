import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { loadParentLinksForUser } from '~/lib/kinder/parent/load-parent';

import { ParentChildCard } from './_components/parent-child-card';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:parent.title'),
  };
};

async function ParentHomePage() {
  const user = await requireUserInServerComponent();
  const children = await loadParentLinksForUser(user.id);

  return (
    <>
      <PageHeader
        description={<Trans i18nKey="kinder:parent.homeDescription" />}
        title={<Trans i18nKey="kinder:parent.myChildren" />}
      />

      <PageBody>
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <ParentChildCard child={child} key={child.studentId} />
          ))}
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(ParentHomePage);

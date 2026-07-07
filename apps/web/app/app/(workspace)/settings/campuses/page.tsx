import { Building2 } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  EmptyState,
  KinderPageBody,
  KinderPageHeader,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { loadPublicPackages } from '~/lib/kinder/subscription/features';
import { loadQuotaFormSummary } from '~/lib/kinder/subscription/quotas';
import {
  getSchoolContext,
  loadCampuses,
} from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { CampusesWorkspace } from './_components/campuses-workspace';
import { CreateCampusDialog } from './_components/create-campus-dialog';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:campuses.title'),
  };
};

async function CampusesPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  await assertModuleAccessFromContext(
    context,
    pathsConfig.app.settingsCampuses,
    'manage',
  );

  const campuses = await loadCampuses(context.school.id);
  const client = getSupabaseServerClient();
  const packages = await loadPublicPackages(client);
  const quotaSummary = await loadQuotaFormSummary(client, context, packages);

  return (
    <>
      <KinderPageHeader
        actions={
          <CreateCampusDialog
            campuses={campuses}
            quotaSummary={quotaSummary}
            schoolId={context.school.id}
          />
        }
        breadcrumbs={[
          {
            label: <Trans i18nKey="common:routes.settings" />,
          },
          { label: <Trans i18nKey="kinder:campuses.title" /> },
        ]}
        description={<Trans i18nKey="kinder:campuses.description" />}
        title={<Trans i18nKey="kinder:campuses.title" />}
      />

      <KinderPageBody>
        {campuses.length === 0 ? (
          <EmptyState
            descriptionKey="kinder:campuses.emptyDescription"
            icon={Building2}
            titleKey="kinder:campuses.empty"
          />
        ) : (
          <CampusesWorkspace campuses={campuses} />
        )}
      </KinderPageBody>
    </>
  );
}

export default withI18n(CampusesPage);

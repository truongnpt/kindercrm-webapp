import { Trans } from '@kit/ui/trans';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import {
  loadLeadSources,
  loadLeads,
  loadSchoolMembersForAssign,
} from '~/lib/kinder/crm/load-leads';
import { seedDefaultLeadSources } from '~/lib/kinder/crm/seed-lead-sources';
import pathsConfig from '~/config/paths.config';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateLeadDialog } from './_components/create-lead-dialog';
import { CrmOverview } from './_components/crm-overview';
import { CrmWorkspace } from './_components/crm-workspace';
import { LeadImportExport } from './_components/lead-import-export';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:crm.title'),
  };
};

async function CrmPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  await assertModuleAccessFromContext(context, pathsConfig.app.crm, 'view');

  const client = getSupabaseServerClient();
  let sources = await loadLeadSources(context.school.id);

  if (sources.length === 0) {
    await seedDefaultLeadSources(client, context.school.id);
    sources = await loadLeadSources(context.school.id);
  }

  const leads = await loadLeads(context.school.id);
  const members = await loadSchoolMembersForAssign(context.school.id);

  return (
    <>
      <KinderPageHeader
        actions={
          <>
            <LeadImportExport leads={leads} schoolId={context.school.id} />
            <CreateLeadDialog schoolId={context.school.id} sources={sources} />
          </>
        }
        breadcrumbs={[{ label: <Trans i18nKey="kinder:crm.title" /> }]}
        description={<Trans i18nKey="kinder:crm.description" />}
        title={<Trans i18nKey="kinder:crm.title" />}
      />

      <KinderPageBody>
        <CrmOverview leads={leads} />

        <CrmWorkspace
          leads={leads}
          members={members}
          schoolId={context.school.id}
          sources={sources}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(CrmPage);

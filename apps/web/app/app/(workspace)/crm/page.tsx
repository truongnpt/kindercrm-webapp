import { Trans } from '@kit/ui/trans';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  KinderPageBody,
  KinderPageHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import { loadLeadSources, loadLeads } from '~/lib/kinder/crm/load-leads';
import { seedDefaultLeadSources } from '~/lib/kinder/crm/seed-lead-sources';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CreateLeadDialog } from './_components/create-lead-dialog';
import { LeadImportExport } from './_components/lead-import-export';
import { LeadListTable, LeadPipelineBoard } from './_components/lead-pipeline';

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

  requirePackageFeature(context, 'crm');

  const client = getSupabaseServerClient();
  let sources = await loadLeadSources(context.school.id);

  if (sources.length === 0) {
    await seedDefaultLeadSources(client, context.school.id);
    sources = await loadLeadSources(context.school.id);
  }

  const leads = await loadLeads(context.school.id);

  return (
    <>
      <KinderPageHeader
        actions={
          <>
            <LeadImportExport leads={leads} schoolId={context.school.id} />
            <CreateLeadDialog schoolId={context.school.id} sources={sources} />
          </>
        }
        description={<Trans i18nKey="kinder:crm.description" />}
        title={<Trans i18nKey="kinder:crm.title" />}
      />

      <KinderPageBody>
        <TabbedModule defaultValue="pipeline">
          <TabbedModuleList>
            <TabbedModuleTrigger value="pipeline">
              <Trans i18nKey="kinder:crm.pipeline" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="list">
              <Trans i18nKey="kinder:crm.list" />
            </TabbedModuleTrigger>
          </TabbedModuleList>

          <TabbedModuleContent value="pipeline">
            <LeadPipelineBoard leads={leads} schoolId={context.school.id} />
          </TabbedModuleContent>

          <TabbedModuleContent value="list">
            <LeadListTable leads={leads} />
          </TabbedModuleContent>
        </TabbedModule>
      </KinderPageBody>
    </>
  );
}

export default withI18n(CrmPage);

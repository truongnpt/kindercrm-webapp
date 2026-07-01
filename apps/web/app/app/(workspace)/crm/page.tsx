import { PageBody, PageHeader, PageHeaderActions } from '@kit/ui/page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

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
      <PageHeader
        description={<Trans i18nKey="kinder:crm.description" />}
        title={<Trans i18nKey="kinder:crm.title" />}
      >
        <PageHeaderActions>
          <LeadImportExport leads={leads} schoolId={context.school.id} />
          <CreateLeadDialog schoolId={context.school.id} sources={sources} />
        </PageHeaderActions>
      </PageHeader>

      <PageBody>
        <Tabs defaultValue="pipeline">
          <TabsList>
            <TabsTrigger value="pipeline">
              <Trans i18nKey="kinder:crm.pipeline" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <Trans i18nKey="kinder:crm.list" />
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="pipeline">
            <LeadPipelineBoard leads={leads} schoolId={context.school.id} />
          </TabsContent>

          <TabsContent className="mt-4" value="list">
            <LeadListTable leads={leads} />
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

export default withI18n(CrmPage);

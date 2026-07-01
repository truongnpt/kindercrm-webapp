import { notFound } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import {
  DetailPageHeader,
  KinderPageBody,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  loadLeadActivities,
  loadLeadById,
  loadLeadNotes,
  loadLeadSources,
  loadSchoolMembersForAssign,
} from '~/lib/kinder/crm/load-leads';
import { LEAD_STAGE_I18N_KEYS } from '~/lib/kinder/crm/pipeline-stages';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { LeadDetailActions } from './_components/lead-detail-actions';
import { LeadDetailWorkspace } from './_components/lead-detail-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:crm.detail'),
  };
};

async function LeadDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'crm');

  const lead = await loadLeadById(context.school.id, leadId);

  if (!lead) {
    notFound();
  }

  const [sources, members, notes, activities] = await Promise.all([
    loadLeadSources(context.school.id),
    loadSchoolMembersForAssign(context.school.id),
    loadLeadNotes(context.school.id, leadId),
    loadLeadActivities(context.school.id, leadId),
  ]);

  return (
    <>
      <DetailPageHeader
        actions={
          <LeadDetailActions
            lead={lead}
            members={members}
            schoolId={context.school.id}
            sources={sources}
          />
        }
        backHref={pathsConfig.app.crm}
        breadcrumbs={[
          {
            label: <Trans i18nKey="kinder:crm.title" />,
            href: pathsConfig.app.crm,
          },
          { label: lead.parent_name },
        ]}
        description={<Trans i18nKey={LEAD_STAGE_I18N_KEYS[lead.stage]} />}
        title={lead.parent_name}
      />

      <KinderPageBody>
        <LeadDetailWorkspace
          activities={activities}
          lead={lead}
          leadId={leadId}
          members={members}
          notes={notes}
          schoolId={context.school.id}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(LeadDetailPage);

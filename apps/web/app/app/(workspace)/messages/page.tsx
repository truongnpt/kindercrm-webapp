import { Trans } from '@kit/ui/trans';

import { CommunicationWorkspace } from '~/components/communication/communication-workspace';
import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import {
  loadCommunicationMessages,
  loadStaffCommunicationThreads,
} from '~/lib/kinder/communication/load-communication';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:communication.title'),
  };
};

async function StaffMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ threadId?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'parent_portal');
  await assertModuleAccessFromContext(
    context,
    pathsConfig.app.messages,
    'view',
  );

  const threads = await loadStaffCommunicationThreads(
    context.school.id,
    user.id,
    context.role,
  );

  const activeThread = params.threadId
    ? threads.find((thread) => thread.id === params.threadId)
    : undefined;

  const messages = activeThread
    ? await loadCommunicationMessages(context.school.id, activeThread.id, user.id)
    : [];

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[{ label: <Trans i18nKey="kinder:communication.title" /> }]}
        description={<Trans i18nKey="kinder:communication.staffDescription" />}
        title={<Trans i18nKey="kinder:communication.title" />}
      />

      <KinderPageBody>
        <CommunicationWorkspace
          activeThreadId={activeThread?.id}
          currentUserId={user.id}
          messages={messages}
          mode="staff"
          schoolId={context.school.id}
          threads={threads}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(StaffMessagesPage);

import { Trans } from '@kit/ui/trans';

import { ParentSectionHeader } from '~/components/parent-portal';
import { CommunicationWorkspace } from '~/components/communication/communication-workspace';
import {
  loadCommunicationMessages,
  loadParentCommunicationThreads,
} from '~/lib/kinder/communication/load-communication';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:communication.title'),
  };
};

async function ParentMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    threadId?: string;
    studentId?: string;
    schoolId?: string;
  }>;
}) {
  const params = await searchParams;
  const user = await requireUserInServerComponent();

  const threads = await loadParentCommunicationThreads(user.id, {
    schoolId: params.schoolId,
    studentId: params.studentId,
  });

  const activeThread = params.threadId
    ? threads.find((thread) => thread.id === params.threadId)
    : undefined;

  const schoolId = activeThread?.school_id ?? threads[0]?.school_id ?? '';

  const messages = activeThread
    ? await loadCommunicationMessages(schoolId, activeThread.id, user.id)
    : [];

  return (
    <div className="flex flex-col gap-5">
      <ParentSectionHeader
        description={<Trans i18nKey="kinder:communication.parentDescription" />}
        title={<Trans i18nKey="kinder:communication.title" />}
      />

      <CommunicationWorkspace
        activeThreadId={activeThread?.id}
        currentUserId={user.id}
        messages={messages}
        mode="parent"
        schoolId={schoolId}
        threads={threads}
      />
    </div>
  );
}

export default withI18n(ParentMessagesPage);

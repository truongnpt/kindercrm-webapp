import { Trans } from '@kit/ui/trans';

import {
  KinderPageBody,
  KinderPageHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';

import { getAiConfig } from '~/lib/kinder/ai/config';
import { getAiCreditStatus } from '~/lib/kinder/ai/credits';
import {
  loadAiChatMessages,
  loadAiChatSessions,
  loadAiKnowledgeArticles,
} from '~/lib/kinder/ai/load-ai';
import {
  buildRuleBasedInsights,
  buildSchoolAiContext,
} from '~/lib/kinder/ai/school-context';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { AiChatPanel } from './_components/ai-chat-panel';
import { AiInsightsPanel } from './_components/ai-insights-panel';
import { AiKnowledgePanel } from './_components/ai-knowledge-panel';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:ai.title'),
  };
};

async function AiAssistantPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; session?: string }>;
}) {
  const { tab, session: sessionId } = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'ai_assistant');

  const [sessions, articles, creditStatus, schoolContext, aiConfig] =
    await Promise.all([
      loadAiChatSessions(context.school.id, user.id),
      loadAiKnowledgeArticles(context.school.id),
      getAiCreditStatus(
        context.school.id,
        context.package,
        context.subscription,
      ),
      buildSchoolAiContext(context.school.id, context.school.name),
      Promise.resolve(getAiConfig()),
    ]);

  const activeSessionId = sessionId ?? sessions[0]?.id;
  const messages = activeSessionId
    ? await loadAiChatMessages(context.school.id, activeSessionId)
    : [];
  const initialInsights = buildRuleBasedInsights(schoolContext);

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[{ label: <Trans i18nKey="kinder:ai.title" /> }]}
        description={
          aiConfig.isConfigured ? (
            <Trans i18nKey="kinder:ai.description" />
          ) : (
            <Trans i18nKey="kinder:ai.descriptionFallback" />
          )
        }
        title={<Trans i18nKey="kinder:ai.title" />}
      />

      <KinderPageBody>
        <TabbedModule defaultValue={tab ?? 'chat'}>
          <TabbedModuleList>
            <TabbedModuleTrigger value="chat">
              <Trans i18nKey="kinder:ai.tabs.chat" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="insights">
              <Trans i18nKey="kinder:ai.tabs.insights" />
            </TabbedModuleTrigger>
            <TabbedModuleTrigger value="knowledge">
              <Trans i18nKey="kinder:ai.tabs.knowledge" />
            </TabbedModuleTrigger>
          </TabbedModuleList>

          <TabbedModuleContent value="chat">
            <AiChatPanel
              creditsRemaining={creditStatus.creditsRemaining}
              initialMessages={messages}
              initialSessionId={activeSessionId}
              schoolId={context.school.id}
              sessions={sessions}
            />
          </TabbedModuleContent>

          <TabbedModuleContent value="insights">
            <AiInsightsPanel
              initialInsights={initialInsights}
              schoolId={context.school.id}
            />
          </TabbedModuleContent>

          <TabbedModuleContent value="knowledge">
            <AiKnowledgePanel
              articles={articles}
              schoolId={context.school.id}
            />
          </TabbedModuleContent>
        </TabbedModule>
      </KinderPageBody>
    </>
  );
}

export default withI18n(AiAssistantPage);

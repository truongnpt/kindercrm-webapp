'use client';

import { BookOpen, MessageSquare, Sparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { AiChatMessage, AiChatSession, AiInsightReport, AiKnowledgeArticle } from '~/lib/kinder/ai/types';

import { AiChatPanel } from './ai-chat-panel';
import { AiInsightsPanel } from './ai-insights-panel';
import { AiKnowledgePanel } from './ai-knowledge-panel';

export function AiWorkspace({
  schoolId,
  defaultTab,
  activeSessionId,
  sessions,
  messages,
  initialInsights,
  articles,
  creditsRemaining,
}: {
  schoolId: string;
  defaultTab: string;
  activeSessionId?: string;
  sessions: AiChatSession[];
  messages: AiChatMessage[];
  initialInsights: AiInsightReport;
  articles: AiKnowledgeArticle[];
  creditsRemaining: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') ?? defaultTab;

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathsConfig.app.ai}?${params.toString()}`);
  };

  return (
    <BentoTile className="min-w-0 overflow-hidden p-0" padding="none">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <BentoTileHeader
          className="mb-0 border-0 pb-0"
          description={<Trans i18nKey="kinder:ai.workspaceHint" />}
          title={<Trans i18nKey="kinder:ai.workspaceTitle" />}
        />
      </div>

      <TabbedModule
        className="min-w-0 gap-0 p-4 sm:p-6"
        defaultValue={defaultTab}
        onValueChange={setTab}
        value={activeTab}
      >
        <TabbedModuleList className="mb-4 flex-wrap">
          <TabbedModuleTrigger value="chat">
            <MessageSquare className="mr-2 size-4" />
            <Trans i18nKey="kinder:ai.tabs.chat" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="insights">
            <Sparkles className="mr-2 size-4" />
            <Trans i18nKey="kinder:ai.tabs.insights" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="knowledge">
            <BookOpen className="mr-2 size-4" />
            <Trans i18nKey="kinder:ai.tabs.knowledge" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent value="chat">
          <AiChatPanel
            creditsRemaining={creditsRemaining}
            initialMessages={messages}
            initialSessionId={activeSessionId}
            schoolId={schoolId}
            sessions={sessions}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="insights">
          <AiInsightsPanel
            initialInsights={initialInsights}
            schoolId={schoolId}
          />
        </TabbedModuleContent>

        <TabbedModuleContent value="knowledge">
          <AiKnowledgePanel articles={articles} schoolId={schoolId} />
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );
}

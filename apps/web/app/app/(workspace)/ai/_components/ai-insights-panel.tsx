'use client';

import { useState, useTransition } from 'react';

import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import {
  draftAiNotificationAction,
  generateAiInsightsAction,
} from '~/lib/kinder/ai/server-actions';
import type { AiInsightReport } from '~/lib/kinder/ai/types';

export function AiInsightsPanel({
  schoolId,
  initialInsights,
}: {
  schoolId: string;
  initialInsights: AiInsightReport;
}) {
  const { t } = useTranslation('kinder');
  const [pending, startTransition] = useTransition();
  const [insights, setInsights] = useState(initialInsights);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState<'parents' | 'staff' | 'all'>('parents');
  const [draft, setDraft] = useState<{ title: string; body: string } | null>(null);

  return (
    <div className="space-y-6">
      <div className="kinder-mobile-card">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-medium">
            <Trans i18nKey="kinder:ai.insightsTitle" />
          </p>
          <Button
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                try {
                  const result = await generateAiInsightsAction({ schoolId });
                  setInsights({
                    enrollmentForecast: result.enrollmentForecast,
                    revenueForecast: result.revenueForecast,
                    summary: result.summary,
                  });
                  toast.success(t('ai.insightsGenerated'));
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : t('common:genericServerError', { ns: 'common' }),
                  );
                }
              });
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            <Trans i18nKey="kinder:ai.refreshInsights" />
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              <Trans i18nKey="kinder:ai.enrollmentForecast" />
            </p>
            <p>{insights.enrollmentForecast}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              <Trans i18nKey="kinder:ai.revenueForecast" />
            </p>
            <p>{insights.revenueForecast}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              <Trans i18nKey="kinder:ai.operationsSummary" />
            </p>
            <p>{insights.summary}</p>
          </div>
        </div>
      </div>

      <div className="kinder-form-panel max-w-xl grid-cols-1">
        <p className="font-medium">
          <Trans i18nKey="kinder:ai.notificationDraft" />
        </p>
        <Input
          onChange={(event) => setTopic(event.target.value)}
          placeholder={t('ai.notificationTopicPlaceholder')}
          value={topic}
        />
        <Select
          onValueChange={(value) =>
            setAudience(value as 'parents' | 'staff' | 'all')
          }
          value={audience}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="parents">
              <Trans i18nKey="kinder:ai.audienceParents" />
            </SelectItem>
            <SelectItem value="staff">
              <Trans i18nKey="kinder:ai.audienceStaff" />
            </SelectItem>
            <SelectItem value="all">
              <Trans i18nKey="kinder:ai.audienceAll" />
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          disabled={pending || !topic.trim()}
          onClick={() => {
            startTransition(async () => {
              try {
                const result = await draftAiNotificationAction({
                  schoolId,
                  topic,
                  audience,
                });
                setDraft({ title: result.title, body: result.body });
                toast.success(t('ai.notificationDrafted'));
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : t('common:genericServerError', { ns: 'common' }),
                );
              }
            });
          }}
          type="button"
        >
          <Trans i18nKey="kinder:ai.draftNotification" />
        </Button>
        {draft ? (
          <div className="bg-muted rounded-md p-3 text-sm">
            <p className="font-medium">{draft.title}</p>
            <p className="text-muted-foreground mt-1">{draft.body}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

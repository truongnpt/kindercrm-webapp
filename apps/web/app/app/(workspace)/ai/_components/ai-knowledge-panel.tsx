'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { UpsertAiKnowledgeSchema } from '~/lib/kinder/ai/schemas/ai.schema';
import { PanelEmpty } from '~/components/kinder-ui';
import {
  deleteAiKnowledgeAction,
  upsertAiKnowledgeAction,
} from '~/lib/kinder/ai/server-actions';
import type { AiKnowledgeArticle } from '~/lib/kinder/ai/types';

export function AiKnowledgePanel({
  schoolId,
  articles,
}: {
  schoolId: string;
  articles: AiKnowledgeArticle[];
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(UpsertAiKnowledgeSchema),
    defaultValues: {
      schoolId,
      title: '',
      content: '',
      category: 'general',
    },
  });

  return (
    <div className="space-y-6">
      {articles.length === 0 ? (
        <PanelEmpty messageKey="kinder:ai.emptyKnowledge" />
      ) : (
        <ul className="kinder-list-panel">
          {articles.map((article) => (
            <li className="flex items-start justify-between gap-3 p-4 text-sm" key={article.id}>
              <div>
                <p className="font-medium">{article.title}</p>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                  {article.content}
                </p>
                <p className="text-muted-foreground mt-1 text-[10px]">
                  {article.category}
                </p>
              </div>
              <Button
                onClick={async () => {
                  const promise = deleteAiKnowledgeAction({
                    schoolId,
                    articleId: article.id,
                  });
                  toast.promise(promise, {
                    loading: t('schoolSettings.saving'),
                    success: t('ai.knowledgeDeleted'),
                    error: t('common:genericServerError', { ns: 'common' }),
                  });
                  await promise;
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                <Trans i18nKey="common:delete" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form
          className="kinder-form-panel max-w-xl grid-cols-1"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertAiKnowledgeAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('ai.knowledgeSaved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({ schoolId, title: '', content: '', category: 'general' });
          })}
        >
          <p className="font-medium">
            <Trans i18nKey="kinder:ai.addKnowledge" />
          </p>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:ai.knowledgeTitle" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:ai.knowledgeCategory" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.notes" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} required rows={4} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">
            <Trans i18nKey="kinder:ai.addKnowledge" />
          </Button>
        </form>
      </Form>
    </div>
  );
}

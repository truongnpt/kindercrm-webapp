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
  FormMessage,
} from '@kit/ui/form';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { PanelEmpty, SectionCard } from '~/components/kinder-ui';
import { CreateLeadNoteSchema } from '~/lib/kinder/crm/schemas/lead.schema';
import { createLeadNoteAction } from '~/lib/kinder/crm/server-actions';

export function LeadNotesPanel({
  leadId,
  schoolId,
  notes,
  activities,
}: {
  leadId: string;
  schoolId: string;
  notes: Array<{ id: string; body: string; created_at: string }>;
  activities: Array<{
    id: string;
    activity_type: string;
    description: string | null;
    created_at: string;
  }>;
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(CreateLeadNoteSchema),
    defaultValues: {
      leadId,
      schoolId,
      body: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const promise = createLeadNoteAction(data);

    toast.promise(promise, {
      loading: t('ui.toast.saving'),
      success: t('ui.toast.saved'),
      error: t('ui.toast.error'),
    });

    await promise;
    form.reset({ leadId, schoolId, body: '' });
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <SectionCard title={<Trans i18nKey="kinder:crm.addNote" />}>
        <Form {...form}>
          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea rows={4} {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              <Trans i18nKey="kinder:crm.addNote" />
            </Button>
          </form>
        </Form>

        {notes.length === 0 ? (
          <PanelEmpty messageKey="kinder:crm.notesEmpty" />
        ) : (
          <ul className="kinder-list-panel mt-4">
            {notes.map((note) => (
              <li className="text-sm" key={note.id}>
                <p>{note.body}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(note.created_at).toLocaleString('vi-VN')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title={<Trans i18nKey="kinder:crm.timeline" />}>
        {activities.length === 0 ? (
          <PanelEmpty messageKey="kinder:crm.activitiesEmpty" />
        ) : (
          <ul className="kinder-list-panel">
            {activities.map((activity) => (
              <li className="text-sm" key={activity.id}>
                <p className="font-medium">{activity.activity_type}</p>
                {activity.description ? <p>{activity.description}</p> : null}
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(activity.created_at).toLocaleString('vi-VN')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}

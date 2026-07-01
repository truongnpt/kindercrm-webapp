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
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import type { LeadRow } from '~/lib/kinder/crm/load-leads';
import {
  LEAD_STAGE_I18N_KEYS,
  LEAD_STAGES,
} from '~/lib/kinder/crm/pipeline-stages';
import { UpdateLeadSchema } from '~/lib/kinder/crm/schemas/lead.schema';
import {
  assignLeadAction,
  deleteLeadAction,
  updateLeadAction,
} from '~/lib/kinder/crm/server-actions';
import { convertLeadToStudentAction } from '~/lib/kinder/students/server-actions';

export function LeadDetailForm({
  lead,
  schoolId,
  sources,
  members,
}: {
  lead: LeadRow;
  schoolId: string;
  sources: Array<{ id: string; name: string }>;
  members: Array<{ id: string; name: string; email: string | null }>;
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(UpdateLeadSchema),
    defaultValues: {
      leadId: lead.id,
      schoolId,
      parentName: lead.parent_name,
      phone: lead.phone,
      email: lead.email ?? '',
      childName: lead.child_name ?? '',
      childDob: lead.child_dob ?? '',
      sourceId: lead.source_id ?? '',
      notes: lead.notes ?? '',
      stage: lead.stage,
      status: lead.status,
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const promise = updateLeadAction(data);

    toast.promise(promise, {
      loading: t('schoolSettings.saving'),
      success: t('schoolSettings.saved'),
      error: t('common:genericServerError', { ns: 'common' }),
    });

    await promise;
  });

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="grid max-w-2xl gap-4" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="parentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.parentName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.phone" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.email" />
                </FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="childName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.childName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="childDob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.childDob" />
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.source" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.stage" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LEAD_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        <Trans i18nKey={LEAD_STAGE_I18N_KEYS[stage]} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.notes" />
                </FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit">
              <Trans i18nKey="kinder:crm.save" />
            </Button>
            <Button
              onClick={() =>
                void convertLeadToStudentAction({
                  leadId: lead.id,
                  schoolId,
                })
              }
              type="button"
              variant="secondary"
            >
              <Trans i18nKey="kinder:students.convertFromLead" />
            </Button>
            <Button
              onClick={() => void deleteLeadAction({ leadId: lead.id, schoolId })}
              type="button"
              variant="destructive"
            >
              <Trans i18nKey="kinder:crm.delete" />
            </Button>
          </div>
        </form>
      </Form>

      <AssignLeadSelect
        assignedTo={lead.assigned_to}
        leadId={lead.id}
        members={members}
        schoolId={schoolId}
      />
    </div>
  );
}

function AssignLeadSelect({
  leadId,
  schoolId,
  assignedTo,
  members,
}: {
  leadId: string;
  schoolId: string;
  assignedTo: string | null;
  members: Array<{ id: string; name: string; email: string | null }>;
}) {
  return (
    <div className="max-w-md space-y-2">
      <p className="text-sm font-medium">
        <Trans i18nKey="kinder:crm.assignedTo" />
      </p>
      <Select
        onValueChange={(value) => {
          void assignLeadAction({
            leadId,
            schoolId,
            assignedTo: value === 'none' ? '' : value,
          });
        }}
        value={assignedTo ?? 'none'}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <Trans i18nKey="kinder:crm.unassigned" />
          </SelectItem>
          {members.map((member) => (
            <SelectItem key={member.id} value={member.id}>
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

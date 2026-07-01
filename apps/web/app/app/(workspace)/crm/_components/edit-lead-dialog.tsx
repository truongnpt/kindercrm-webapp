'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import type { LeadRow } from '~/lib/kinder/crm/load-leads';
import { UpdateLeadSchema } from '~/lib/kinder/crm/schemas/lead.schema';
import {
  assignLeadAction,
  updateLeadAction,
} from '~/lib/kinder/crm/server-actions';

import { LeadFormFields } from './lead-form-fields';

export function EditLeadDialog({
  lead,
  schoolId,
  sources,
  members,
  open: controlledOpen,
  onOpenChange,
  trigger,
  hideTrigger,
}: {
  lead: LeadRow;
  schoolId: string;
  sources: Array<{ id: string; name: string }>;
  members: Array<{ id: string; name: string; email: string | null }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  hideTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const invalidateLead = [
    kinderQueryKeys.crm.lead(schoolId, lead.id),
    kinderQueryKeys.crm.leads(schoolId),
  ] as const;

  const updateLead = useKinderMutation({
    mutationFn: updateLeadAction,
    invalidateKeys: [...invalidateLead],
    onSuccess: () => setOpen(false),
  });

  const assignLead = useKinderMutation({
    mutationFn: assignLeadAction,
    invalidateKeys: [kinderQueryKeys.crm.lead(schoolId, lead.id)],
    toast: false,
  });

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

  useEffect(() => {
    if (open) {
      form.reset({
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
      });
    }
  }, [open, lead, schoolId, form]);

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:crm.detail" />}
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:ui.edit" />}
      trigger={
        hideTrigger ? undefined : (
          trigger ?? (
            <Button size="sm" type="button" variant="outline">
              <Pencil className="mr-2 size-4" />
              <Trans i18nKey="kinder:ui.edit" />
            </Button>
          )
        )
      }
      footer={
        <KinderSubmitButton
          loading={updateLead.isPending}
          onClick={form.handleSubmit((data) => updateLead.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:crm.save" />
        </KinderSubmitButton>
      }
    >
      <Form {...form}>
        <form className="flex flex-col gap-5">
          <LeadFormFields form={form} showStage sources={sources} />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">
              <Trans i18nKey="kinder:crm.assignedTo" />
            </p>
            <Select
              disabled={assignLead.isPending}
              onValueChange={(value) => {
                assignLead.mutate({
                  leadId: lead.id,
                  schoolId,
                  assignedTo: value === 'none' ? '' : value,
                });
              }}
              value={lead.assigned_to ?? 'none'}
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
        </form>
      </Form>
    </KinderFormDialog>
  );
}

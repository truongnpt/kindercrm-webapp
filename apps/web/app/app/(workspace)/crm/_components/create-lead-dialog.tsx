'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { CreateLeadSchema } from '~/lib/kinder/crm/schemas/lead.schema';
import { createLeadAction } from '~/lib/kinder/crm/server-actions';

import { LeadFormFields } from './lead-form-fields';

export function CreateLeadDialog({
  schoolId,
  sources,
}: {
  schoolId: string;
  sources: Array<{ id: string; name: string }>;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateLeadSchema),
    defaultValues: {
      schoolId,
      parentName: '',
      phone: '',
      email: '',
      childName: '',
      childDob: '',
      sourceId: '',
      notes: '',
      stage: 'new' as const,
    },
  });

  const createLead = useKinderMutation({
    mutationFn: createLeadAction,
    invalidateKeys: [kinderQueryKeys.crm.leads(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        parentName: '',
        phone: '',
        email: '',
        childName: '',
        childDob: '',
        sourceId: '',
        notes: '',
        stage: 'new',
      });
      setOpen(false);
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:crm.description" />}
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:crm.createLead" />}
      trigger={
        <Button className="rounded-full px-5">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:crm.createLead" />
        </Button>
      }
      footer={
        <KinderSubmitButton
          loading={createLead.isPending}
          onClick={form.handleSubmit((data) => createLead.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:crm.createLead" />
        </KinderSubmitButton>
      }
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <LeadFormFields form={form} sources={sources} />
        </form>
      </Form>
    </KinderFormDialog>
  );
}

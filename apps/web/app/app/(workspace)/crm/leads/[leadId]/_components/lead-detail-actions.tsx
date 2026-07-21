'use client';

import { useState } from 'react';

import { Pencil, Trash2, UserPlus } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  KinderConfirmDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import type { LeadRow } from '~/lib/kinder/crm/load-leads';
import { deleteLeadAction } from '~/lib/kinder/crm/server-actions';
import { convertLeadToStudentAction } from '~/lib/kinder/students/server-actions';

import { EditLeadDialog } from '../../../_components/edit-lead-dialog';

export function LeadDetailActions({
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
  const [deleteOpen, setDeleteOpen] = useState(false);

  const invalidateLead = [
    kinderQueryKeys.crm.lead(schoolId, lead.id),
    kinderQueryKeys.crm.leads(schoolId),
  ] as const;

  const convertLead = useKinderMutation({
    mutationFn: convertLeadToStudentAction,
    invalidateKeys: [
      ...invalidateLead,
      kinderQueryKeys.students.list(schoolId),
    ],
  });

  const deleteLead = useKinderMutation({
    mutationFn: deleteLeadAction,
    invalidateKeys: [kinderQueryKeys.crm.leads(schoolId)],
    refresh: false,
    onSuccess: () => setDeleteOpen(false),
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <EditLeadDialog
          lead={lead}
          members={members}
          schoolId={schoolId}
          sources={sources}
        />
        <KinderSubmitButton
          loading={convertLead.isPending}
          onClick={() =>
            convertLead.mutate({ leadId: lead.id, schoolId })
          }
          type="button"
          variant="secondary"
        >
          <UserPlus className="mr-2 size-4" />
          <Trans i18nKey="kinder:students.convertFromLead" />
        </KinderSubmitButton>
        <Button
 onClick={() => setDeleteOpen(true)}
          type="button"
          variant="destructive"
        >
          <Trash2 className="mr-2 size-4" />
          <Trans i18nKey="kinder:ui.delete" />
        </Button>
      </div>

      <KinderConfirmDialog
        description={<Trans i18nKey="kinder:ui.confirmDeleteDescription" />}
        onConfirm={() => deleteLead.mutate({ leadId: lead.id, schoolId })}
        onOpenChange={setDeleteOpen}
        open={deleteOpen}
        pending={deleteLead.isPending}
        title={<Trans i18nKey="kinder:ui.confirmDelete" />}
        confirmLabel={<Trans i18nKey="kinder:crm.delete" />}
      />
    </>
  );
}

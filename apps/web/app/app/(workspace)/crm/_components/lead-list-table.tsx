'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { Search, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  EntityRowActions,
  KinderConfirmDialog,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { LeadRow } from '~/lib/kinder/crm/load-leads';
import { deleteLeadAction } from '~/lib/kinder/crm/server-actions';

import { CrmLeadAvatar } from './crm-lead-avatar';
import { CrmStageBadge } from './crm-stage-badge';
import { EditLeadDialog } from './edit-lead-dialog';

export function LeadListTable({
  leads,
  schoolId,
  sources,
  members,
}: {
  leads: LeadRow[];
  schoolId: string;
  sources: Array<{ id: string; name: string }>;
  members: Array<{ id: string; name: string; email: string | null }>;
}) {
  const { t } = useTranslation('kinder');
  const [query, setQuery] = useState('');
  const [editLead, setEditLead] = useState<LeadRow | null>(null);
  const [deleteLead, setDeleteLead] = useState<LeadRow | null>(null);

  const deleteMutation = useKinderMutation({
    mutationFn: deleteLeadAction,
    invalidateKeys: [kinderQueryKeys.crm.leads(schoolId)],
    refresh: false,
    onSuccess: () => setDeleteLead(null),
  });

  const filteredLeads = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return leads;
    }

    return leads.filter((lead) => {
      const haystack = [
        lead.parent_name,
        lead.phone,
        lead.email,
        lead.child_name,
        lead.source?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [leads, query]);

  if (leads.length === 0) {
    return (
      <EmptyState
        compact
        descriptionKey="kinder:crm.emptyDescription"
        icon={Users}
        titleKey="kinder:crm.empty"
      />
    );
  }

  return (
    <>
      {filteredLeads.length === 0 ? (
        <EmptyState
          compact
          descriptionKey="kinder:crm.searchEmpty"
          icon={Users}
          titleKey="kinder:workspace.searchEmpty"
        />
      ) : (
        <>
        <DataTableCard
          description={<Trans i18nKey="kinder:crm.listDescription" />}
          title={<Trans i18nKey="kinder:crm.list" />}
          toolbar={
            <div className="relative max-w-md">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                className="h-11 rounded-lg border-border bg-muted/30 pl-10 shadow-none focus-visible:border-primary/40"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('crm.searchPlaceholder')}
                value={query}
              />
            </div>
          }
        >
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:crm.parentName" />
                </th>
                <th className="hidden md:table-cell">
                  <Trans i18nKey="kinder:crm.phone" />
                </th>
                <th className="hidden lg:table-cell">
                  <Trans i18nKey="kinder:crm.source" />
                </th>
                <th>
                  <Trans i18nKey="kinder:crm.stage" />
                </th>
                <th className="text-right" />
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <CrmLeadAvatar name={lead.parent_name} size="sm" />
                      <div className="min-w-0">
                        <Link
                          className="text-foreground hover:text-primary font-medium transition-colors"
                          href={`${pathsConfig.app.crmLead}/${lead.id}`}
                        >
                          {lead.parent_name}
                        </Link>
                        {lead.child_name ? (
                          <p className="text-muted-foreground mt-0.5 truncate text-xs">
                            {lead.child_name}
                          </p>
                        ) : null}
                        <p className="text-muted-foreground mt-0.5 text-xs md:hidden">
                          {lead.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground hidden md:table-cell">
                    {lead.phone}
                  </td>
                  <td className="hidden lg:table-cell">
                    {lead.source?.name ?
                      <span className="bg-muted/60 text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
                        {lead.source.name}
                      </span>
                    : '—'}
                  </td>
                  <td>
                    <CrmStageBadge stage={lead.stage} />
                  </td>
                  <td className="text-right">
                    <EntityRowActions
                      onDelete={() => setDeleteLead(lead)}
                      onEdit={() => setEditLead(lead)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableCard>

        <div className="space-y-3 md:hidden">
          {filteredLeads.map((lead) => (
            <article className="kinder-mobile-card" key={lead.id}>
              <div className="flex items-start gap-3">
                <CrmLeadAvatar name={lead.parent_name} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      className="text-foreground font-medium hover:text-primary hover:underline"
                      href={`${pathsConfig.app.crmLead}/${lead.id}`}
                    >
                      {lead.parent_name}
                    </Link>
                    <CrmStageBadge stage={lead.stage} />
                  </div>
                  {lead.child_name ? (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {lead.child_name}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground mt-1 text-xs">
                    {lead.phone}
                  </p>
                </div>
              </div>
              <EntityRowActions
                onDelete={() => setDeleteLead(lead)}
                onEdit={() => setEditLead(lead)}
              />
            </article>
          ))}
        </div>
        </>
      )}

      {editLead ? (
        <EditLeadDialog
          hideTrigger
          lead={editLead}
          members={members}
          onOpenChange={(open) => {
            if (!open) {
              setEditLead(null);
            }
          }}
          open
          schoolId={schoolId}
          sources={sources}
        />
      ) : null}

      <KinderConfirmDialog
        description={<Trans i18nKey="kinder:ui.confirmDeleteDescription" />}
        onConfirm={() => {
          if (deleteLead) {
            deleteMutation.mutate({
              leadId: deleteLead.id,
              schoolId,
            });
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteLead(null);
          }
        }}
        open={Boolean(deleteLead)}
        pending={deleteMutation.isPending}
        title={<Trans i18nKey="kinder:ui.confirmDelete" />}
        confirmLabel={<Trans i18nKey="kinder:crm.delete" />}
      />
    </>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DraggableAttributes,
} from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { CSS } from '@dnd-kit/utilities';
import { Baby, GripVertical, Kanban, Phone } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import {
  EmptyState,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import type { LeadRow } from '~/lib/kinder/crm/load-leads';
import {
  ACTIVE_PIPELINE_STAGES,
  LEAD_STAGE_I18N_KEYS,
  type LeadStage,
} from '~/lib/kinder/crm/pipeline-stages';
import { updateLeadStageAction } from '~/lib/kinder/crm/server-actions';

import { CrmLeadAvatar } from './crm-lead-avatar';
import { CrmStageDot } from './crm-stage-badge';

type LeadsByStage = Record<LeadStage, LeadRow[]>;

function groupLeadsByStage(leads: LeadRow[]): LeadsByStage {
  const grouped = Object.fromEntries(
    ACTIVE_PIPELINE_STAGES.map((stage) => [stage, [] as LeadRow[]]),
  ) as LeadsByStage;

  for (const lead of leads) {
    if (ACTIVE_PIPELINE_STAGES.includes(lead.stage)) {
      grouped[lead.stage].push(lead);
    }
  }

  return grouped;
}

function findLeadStage(
  grouped: LeadsByStage,
  leadId: string,
): LeadStage | null {
  for (const stage of ACTIVE_PIPELINE_STAGES) {
    if (grouped[stage].some((lead) => lead.id === leadId)) {
      return stage;
    }
  }

  return null;
}

export function LeadPipelineBoard({
  leads,
  schoolId,
}: {
  leads: LeadRow[];
  schoolId: string;
}) {
  const [items, setItems] = useState<LeadsByStage>(() =>
    groupLeadsByStage(leads),
  );
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  useEffect(() => {
    setItems(groupLeadsByStage(leads));
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const updateStage = useKinderMutation({
    mutationFn: updateLeadStageAction,
    invalidateKeys: [kinderQueryKeys.crm.leads(schoolId)],
  });

  const activeLead = useMemo(() => {
    if (!activeLeadId) {
      return null;
    }

    for (const stage of ACTIVE_PIPELINE_STAGES) {
      const lead = items[stage].find((item) => item.id === activeLeadId);

      if (lead) {
        return lead;
      }
    }

    return null;
  }, [activeLeadId, items]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveLeadId(String(event.active.id));
  };

  const moveLead = (leadId: string, targetStage: LeadStage) => {
    const sourceStage = findLeadStage(items, leadId);

    if (!sourceStage || sourceStage === targetStage) {
      return;
    }

    const previous = items;

    setItems((current) => {
      const lead = current[sourceStage].find((item) => item.id === leadId);

      if (!lead) {
        return current;
      }

      return {
        ...current,
        [sourceStage]: current[sourceStage].filter((item) => item.id !== leadId),
        [targetStage]: [
          ...current[targetStage],
          { ...lead, stage: targetStage },
        ],
      };
    });

    updateStage.mutate(
      { leadId, schoolId, stage: targetStage },
      {
        onError: () => {
          setItems(previous);
        },
      },
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLeadId(null);

    const { active, over } = event;

    if (!over) {
      return;
    }

    const targetStage = String(over.id) as LeadStage;

    if (!ACTIVE_PIPELINE_STAGES.includes(targetStage)) {
      return;
    }

    moveLead(String(active.id), targetStage);
  };

  const handleDragCancel = () => {
    setActiveLeadId(null);
  };

  if (leads.length === 0) {
    return (
      <EmptyState
        actionLabelKey="kinder:crm.createLead"
        descriptionKey="kinder:crm.emptyDescription"
        icon={Kanban}
        titleKey="kinder:crm.empty"
      />
    );
  }

  const totalLeads = leads.length;

  return (
    <DndContext
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
      collisionDetection={pointerWithin}
    >
      <div className="kinder-crm-kanban-toolbar">
        <div className="kinder-crm-stage-pills">
          <span className="kinder-crm-stage-pill kinder-crm-stage-pill--active">
            <Trans i18nKey="kinder:crm.allLeads" />
            <span className="kinder-crm-stage-pill__count">{totalLeads}</span>
          </span>
          {ACTIVE_PIPELINE_STAGES.map((stage) => (
            <span className="kinder-crm-stage-pill" key={stage}>
              <Trans i18nKey={LEAD_STAGE_I18N_KEYS[stage]} />
              <span className="kinder-crm-stage-pill__count">
                {items[stage].length}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="kinder-crm-kanban">
        {ACTIVE_PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage}
            leads={items[stage]}
            onStageChange={moveLead}
            stage={stage}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
        {activeLead ? (
          <LeadPipelineCardContent
            className="kinder-crm-lead-card--overlay translate-y-2/2 lg:-translate-x-2/2 lg:-translate-y-1/2"
            dragHandle={false}
            isOverlay
            lead={activeLead}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function PipelineColumn({
  stage,
  leads,
  onStageChange,
}: {
  stage: LeadStage;
  leads: LeadRow[];
  onStageChange: (leadId: string, targetStage: LeadStage) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });

  return (
    <section
      className={cn(
        'kinder-crm-column flex min-w-0 flex-col',
        isOver && 'kinder-crm-column--over',
      )}
      ref={setNodeRef}
    >
      <header className="mb-3 flex items-center justify-between gap-2 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <CrmStageDot stage={stage} />
          <h3 className="truncate text-sm font-semibold">
            <Trans i18nKey={LEAD_STAGE_I18N_KEYS[stage]} />
          </h3>
        </div>
        <span className="kinder-crm-stage-pill__count bg-muted px-2 py-0.5">
          {leads.length}
        </span>
      </header>

      <div className="flex min-h-[120px] flex-1 flex-col gap-2.5 overflow-y-auto">
        {leads.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed border-border/50 bg-muted/20 px-4 py-8 text-center text-xs leading-relaxed">
            <Trans i18nKey="kinder:crm.columnEmpty" />
          </p>
        ) : (
          leads.map((lead) => (
            <LeadPipelineCard
              key={lead.id}
              lead={lead}
              onStageChange={onStageChange}
            />
          ))
        )}
      </div>
    </section>
  );
}

function LeadPipelineCard({
  lead,
  onStageChange,
}: {
  lead: LeadRow;
  onStageChange: (leadId: string, targetStage: LeadStage) => void;
}) {
  const { attributes, isDragging, listeners, setNodeRef, setActivatorNodeRef } =
    useDraggable({
      id: lead.id,
      data: { stage: lead.stage },
    });

  return (
    <div
      className={cn(isDragging && 'kinder-crm-lead-card--dragging')}
      ref={setNodeRef}
    >
      <LeadPipelineCardContent
        dragAttributes={attributes}
        dragListeners={listeners}
        lead={lead}
        onStageChange={onStageChange}
        setActivatorNodeRef={setActivatorNodeRef}
      />
    </div>
  );
}

function LeadPipelineCardContent({
  lead,
  onStageChange,
  setActivatorNodeRef,
  dragListeners,
  dragAttributes,
  dragHandle = true,
  isOverlay = false,
  className,
}: {
  lead: LeadRow;
  onStageChange?: (leadId: string, targetStage: LeadStage) => void;
  setActivatorNodeRef?: (element: HTMLElement | null) => void;
  dragListeners?: SyntheticListenerMap;
  dragAttributes?: DraggableAttributes;
  dragHandle?: boolean;
  isOverlay?: boolean;
  className?: string;
}) {
  const { t } = useTranslation('kinder');

  return (
    <article
      className={cn('kinder-crm-lead-card group min-w-0', className)}
    >
      <div className="flex items-start gap-2">
        {dragHandle ? (
          <button
            aria-label={t('crm.dragLead')}
            className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 cursor-grab touch-none rounded-md p-0.5 active:cursor-grabbing"
            type="button"
            ref={setActivatorNodeRef}
            {...dragAttributes}
            {...dragListeners}
          >
            <GripVertical className="size-4" />
          </button>
        ) : null}

        <CrmLeadAvatar name={lead.parent_name} size="sm" />

        <div className="min-w-0 flex-1">
          {isOverlay ? (
            <p className="text-foreground line-clamp-2 text-sm leading-snug font-semibold">
              {lead.parent_name}
            </p>
          ) : (
            <Link
              className="text-foreground group-hover:text-primary line-clamp-2 text-sm leading-snug font-semibold transition-colors"
              href={`${pathsConfig.app.crmLead}/${lead.id}`}
            >
              {lead.parent_name}
            </Link>
          )}

          <div className="text-muted-foreground mt-1.5 flex flex-col gap-1 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3 shrink-0 opacity-70" />
              {lead.phone}
            </span>
            {lead.child_name ? (
              <span className="inline-flex items-center gap-1.5">
                <Baby className="size-3 shrink-0 opacity-70" />
                {lead.child_name}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {lead.source?.name ? (
        <span className="bg-muted/60 text-muted-foreground mt-3 inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-medium">
          {lead.source.name}
        </span>
      ) : null}

      {!isOverlay ? (
        <Select
          onValueChange={(value) => {
            onStageChange?.(lead.id, value as LeadStage);
          }}
          value={lead.stage}
        >
          <SelectTrigger className="mt-3 h-9 w-full max-w-full rounded-lg border-0 bg-muted/40 text-xs shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[...ACTIVE_PIPELINE_STAGES, 'lost' as const].map((stage) => (
              <SelectItem key={stage} value={stage}>
                <Trans i18nKey={LEAD_STAGE_I18N_KEYS[stage]} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </article>
  );
}

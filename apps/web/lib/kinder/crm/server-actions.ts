'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type { Json } from '~/lib/database.types';

import pathsConfig from '~/config/paths.config';

import {
  AssignLeadSchema,
  CreateLeadNoteSchema,
  CreateLeadSchema,
  DeleteLeadSchema,
  UpdateLeadSchema,
  UpdateLeadStageSchema,
} from './schemas/lead.schema';
import { ImportLeadsSchema } from './schemas/import.schema';

const CRM_PATH = pathsConfig.app.crm;

function revalidateCrmPaths(leadId?: string) {
  revalidatePath(CRM_PATH);

  if (leadId) {
    revalidatePath(`${CRM_PATH}/leads/${leadId}`);
  }
}

async function logLeadActivity(
  params: {
    leadId: string;
    schoolId: string;
    activityType:
      | 'created'
      | 'stage_changed'
      | 'assigned'
      | 'note'
      | 'contact'
      | 'appointment'
      | 'visit'
      | 'deposit'
      | 'enrollment';
    description?: string;
    metadata?: Record<string, unknown>;
    userId: string;
  },
) {
  const client = getSupabaseServerClient();

  await client.from('lead_activities').insert({
    lead_id: params.leadId,
    school_id: params.schoolId,
    activity_type: params.activityType,
    description: params.description ?? null,
    metadata: (params.metadata ?? {}) as Json,
    created_by: params.userId,
  });
}

/** CRM-001 Create Lead */
export const createLeadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: lead, error } = await client
      .from('leads')
      .insert({
        school_id: data.schoolId,
        campus_id: data.campusId || null,
        source_id: data.sourceId || null,
        parent_name: data.parentName,
        phone: data.phone,
        email: data.email || null,
        child_name: data.childName || null,
        child_dob: data.childDob || null,
        notes: data.notes || null,
        stage: data.stage,
        created_by: user.id,
        assigned_to: user.id,
      })
      .select('id')
      .single();

    if (error || !lead) {
      throw error ?? new Error('Failed to create lead');
    }

    await logLeadActivity({
      leadId: lead.id,
      schoolId: data.schoolId,
      activityType: 'created',
      description: `Lead created: ${data.parentName}`,
      userId: user.id,
    });

    revalidateCrmPaths();
    redirect(`${CRM_PATH}/leads/${lead.id}`);
  },
  { schema: CreateLeadSchema },
);

/** CRM-002 Update Lead */
export const updateLeadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: existing } = await client
      .from('leads')
      .select('stage')
      .eq('id', data.leadId)
      .eq('school_id', data.schoolId)
      .single();

    const { error } = await client
      .from('leads')
      .update({
        campus_id: data.campusId || null,
        source_id: data.sourceId || null,
        parent_name: data.parentName,
        phone: data.phone,
        email: data.email || null,
        child_name: data.childName || null,
        child_dob: data.childDob || null,
        notes: data.notes || null,
        stage: data.stage,
        status: data.status,
      })
      .eq('id', data.leadId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    if (existing && data.stage && existing.stage !== data.stage) {
      await logLeadActivity({
        leadId: data.leadId,
        schoolId: data.schoolId,
        activityType: 'stage_changed',
        description: `Stage: ${existing.stage} → ${data.stage}`,
        metadata: { from: existing.stage, to: data.stage },
        userId: user.id,
      });
    }

    revalidateCrmPaths(data.leadId);
    return { success: true };
  },
  { schema: UpdateLeadSchema },
);

/** CRM-003 Delete Lead */
export const deleteLeadAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('leads')
      .update({ deleted_at: new Date().toISOString(), status: 'lost' })
      .eq('id', data.leadId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateCrmPaths();
    redirect(CRM_PATH);
  },
  { schema: DeleteLeadSchema },
);

/** CRM-005 Assign Lead */
export const assignLeadAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('leads')
      .update({
        assigned_to: data.assignedTo || null,
      })
      .eq('id', data.leadId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    await logLeadActivity({
      leadId: data.leadId,
      schoolId: data.schoolId,
      activityType: 'assigned',
      description: data.assignedTo ? 'Lead reassigned' : 'Lead unassigned',
      userId: user.id,
    });

    revalidateCrmPaths(data.leadId);
    return { success: true };
  },
  { schema: AssignLeadSchema },
);

/** CRM-019 Add note */
export const createLeadNoteAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('lead_notes').insert({
      lead_id: data.leadId,
      school_id: data.schoolId,
      body: data.body,
      created_by: user.id,
    });

    if (error) {
      throw error;
    }

    await logLeadActivity({
      leadId: data.leadId,
      schoolId: data.schoolId,
      activityType: 'note',
      description: data.body.slice(0, 120),
      userId: user.id,
    });

    revalidateCrmPaths(data.leadId);
    return { success: true };
  },
  { schema: CreateLeadNoteSchema },
);

/** CRM-006 Move stage (pipeline) */
export const updateLeadStageAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: existing } = await client
      .from('leads')
      .select('stage')
      .eq('id', data.leadId)
      .eq('school_id', data.schoolId)
      .single();

    const status =
      data.stage === 'enrolled' ? 'won' : data.stage === 'lost' ? 'lost' : 'active';

    const { error } = await client
      .from('leads')
      .update({ stage: data.stage, status })
      .eq('id', data.leadId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    if (existing && existing.stage !== data.stage) {
      await logLeadActivity({
        leadId: data.leadId,
        schoolId: data.schoolId,
        activityType: 'stage_changed',
        description: `Stage: ${existing.stage} → ${data.stage}`,
        metadata: { from: existing.stage, to: data.stage },
        userId: user.id,
      });
    }

    revalidateCrmPaths(data.leadId);
    return { success: true };
  },
  { schema: UpdateLeadStageSchema },
);

/** CRM-015 Import leads from CSV */
export const importLeadsAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    let imported = 0;
    const errors: string[] = [];

    for (const [index, row] of data.leads.entries()) {
      try {
        const { data: lead, error } = await client
          .from('leads')
          .insert({
            school_id: data.schoolId,
            parent_name: row.parentName,
            phone: row.phone,
            email: row.email || null,
            child_name: row.childName || null,
            child_dob: row.childDob || null,
            notes: row.notes || null,
            stage: row.stage ?? 'new',
            created_by: user.id,
            assigned_to: user.id,
          })
          .select('id')
          .single();

        if (error || !lead) {
          throw error ?? new Error('Insert failed');
        }

        await logLeadActivity({
          leadId: lead.id,
          schoolId: data.schoolId,
          activityType: 'created',
          description: 'Nhập từ file CSV',
          userId: user.id,
        });

        imported += 1;
      } catch (error) {
        errors.push(
          `Dòng ${index + 2}: ${error instanceof Error ? error.message : 'Lỗi'}`,
        );
      }
    }

    revalidateCrmPaths();

    return { success: true, imported, failed: errors.length, errors };
  },
  { schema: ImportLeadsSchema },
);

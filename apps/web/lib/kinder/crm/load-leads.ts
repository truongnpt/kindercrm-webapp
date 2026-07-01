import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { getSchoolMemberAccounts } from '~/lib/kinder/tenant/account-lookup';

import type { LeadStage } from './pipeline-stages';

export interface LeadRow {
  id: string;
  school_id: string;
  campus_id: string | null;
  source_id: string | null;
  stage: LeadStage;
  status: 'active' | 'won' | 'lost';
  parent_name: string;
  phone: string;
  email: string | null;
  child_name: string | null;
  child_dob: string | null;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  source?: { id: string; name: string; code: string } | null;
}

export const loadLeadSources = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('lead_sources')
    .select('id, name, code, sort_order')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    throw error;
  }

  return data ?? [];
});

export const loadLeads = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('leads')
    .select(
      `
      *,
      source:lead_sources (id, name, code)
    `,
    )
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as LeadRow[];
});

export const loadLeadById = cache(async (schoolId: string, leadId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('leads')
    .select(
      `
      *,
      source:lead_sources (id, name, code)
    `,
    )
    .eq('school_id', schoolId)
    .eq('id', leadId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as LeadRow | null;
});

export const loadLeadNotes = cache(async (schoolId: string, leadId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('lead_notes')
    .select('id, body, created_at, created_by')
    .eq('school_id', schoolId)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
});

export const loadLeadActivities = cache(
  async (schoolId: string, leadId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('lead_activities')
      .select('id, activity_type, description, metadata, created_at, created_by')
      .eq('school_id', schoolId)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  },
);

export const loadSchoolMembersForAssign = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('school_members')
    .select('user_id, role')
    .eq('school_id', schoolId)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  const userIds = (data ?? []).map((row) => row.user_id);

  if (userIds.length === 0) {
    return [];
  }

  return getSchoolMemberAccounts(schoolId, userIds);
});

import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type {
  Student,
  StudentAllergy,
  StudentEmergencyContact,
  StudentMedicalRecord,
  StudentParent,
  StudentPickupPerson,
} from './types';

export const loadStudents = cache(async (schoolId: string, status?: string) => {
  const client = getSupabaseServerClient();

  let query = client
    .from('students')
    .select('*')
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .order('full_name');

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as Student[];
});

export const loadStudentById = cache(
  async (schoolId: string, studentId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('students')
      .select('*')
      .eq('school_id', schoolId)
      .eq('id', studentId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as Student | null;
  },
);

export const loadStudentParents = cache(
  async (schoolId: string, studentId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_parents')
      .select('*')
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .order('is_primary', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as StudentParent[];
  },
);

export const loadStudentEmergencyContacts = cache(
  async (schoolId: string, studentId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_emergency_contacts')
      .select('*')
      .eq('school_id', schoolId)
      .eq('student_id', studentId);

    if (error) {
      throw error;
    }

    return (data ?? []) as StudentEmergencyContact[];
  },
);

export const loadStudentMedicalRecord = cache(
  async (schoolId: string, studentId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_medical_records')
      .select('*')
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data as StudentMedicalRecord | null;
  },
);

export const loadStudentAllergies = cache(
  async (schoolId: string, studentId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_allergies')
      .select('*')
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as StudentAllergy[];
  },
);

export const loadStudentPickupPersons = cache(
  async (schoolId: string, studentId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_pickup_persons')
      .select('*')
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []) as StudentPickupPerson[];
  },
);

export const loadStudentTimeline = cache(
  async (schoolId: string, studentId: string) => {
    const client = getSupabaseServerClient();

    const { data, error } = await client
      .from('student_timeline')
      .select('id, event_type, description, metadata, created_at, created_by')
      .eq('school_id', schoolId)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  },
);

export async function countStudents(schoolId: string) {
  const client = getSupabaseServerClient();

  const { count, error } = await client
    .from('students')
    .select('id', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .is('deleted_at', null);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

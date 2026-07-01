import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type {
  HealthDashboardSummary,
  HealthGrowthRecord,
  HealthIncident,
  HealthMedicalCheckup,
  HealthMedication,
  HealthVaccination,
  StudentHealthSummary,
  StudentOption,
} from './types';

export const loadHealthStudents = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('students')
    .select('id, full_name, student_code')
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .order('full_name');

  if (error) {
    throw error;
  }

  return (data ?? []) as StudentOption[];
});

export const loadHealthDashboardSummary = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();
  const today = new Date();
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const dueLimit = new Date(today);
  dueLimit.setDate(dueLimit.getDate() + 30);
  const dueLimitStr = dueLimit.toISOString().slice(0, 10);

  const [
    students,
    allergies,
    vaccinationsDue,
    incidents,
    growthRecords,
    medications,
  ] = await Promise.all([
    client
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .is('deleted_at', null),
    client
      .from('student_allergies')
      .select('student_id')
      .eq('school_id', schoolId),
    client
      .from('health_vaccinations')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .not('next_due_on', 'is', null)
      .lte('next_due_on', dueLimitStr)
      .gte('next_due_on', today.toISOString().slice(0, 10)),
    client
      .from('health_incidents')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('incident_date', monthStart),
    client
      .from('health_growth_records')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('record_date', monthStart),
    client
      .from('health_medications')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('is_active', true),
  ]);

  const uniqueAllergyStudents = new Set(
    (allergies.data ?? []).map((row) => row.student_id),
  );

  return {
    totalStudents: students.count ?? 0,
    studentsWithAllergies: uniqueAllergyStudents.size,
    vaccinationsDueSoon: vaccinationsDue.count ?? 0,
    incidentsThisMonth: incidents.count ?? 0,
    growthRecordsThisMonth: growthRecords.count ?? 0,
    activeMedications: medications.count ?? 0,
  } satisfies HealthDashboardSummary;
});

export const loadGrowthRecords = cache(
  async (schoolId: string, studentId?: string) => {
    const client = getSupabaseServerClient();

    let query = client
      .from('health_growth_records')
      .select('*')
      .eq('school_id', schoolId)
      .order('record_date', { ascending: false })
      .limit(100);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as HealthGrowthRecord[];
  },
);

export const loadVaccinations = cache(
  async (schoolId: string, studentId?: string) => {
    const client = getSupabaseServerClient();

    let query = client
      .from('health_vaccinations')
      .select('*')
      .eq('school_id', schoolId)
      .order('administered_on', { ascending: false })
      .limit(100);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as HealthVaccination[];
  },
);

export const loadMedicalCheckups = cache(
  async (schoolId: string, studentId?: string) => {
    const client = getSupabaseServerClient();

    let query = client
      .from('health_medical_checkups')
      .select('*')
      .eq('school_id', schoolId)
      .order('checkup_date', { ascending: false })
      .limit(100);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as HealthMedicalCheckup[];
  },
);

export const loadHealthMedications = cache(
  async (schoolId: string, studentId?: string) => {
    const client = getSupabaseServerClient();

    let query = client
      .from('health_medications')
      .select('*')
      .eq('school_id', schoolId)
      .order('start_date', { ascending: false })
      .limit(100);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as HealthMedication[];
  },
);

export const loadHealthIncidents = cache(
  async (schoolId: string, studentId?: string) => {
    const client = getSupabaseServerClient();

    let query = client
      .from('health_incidents')
      .select('*')
      .eq('school_id', schoolId)
      .order('incident_date', { ascending: false })
      .limit(100);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data ?? []) as HealthIncident[];
  },
);

export const loadStudentHealthProfile = cache(
  async (schoolId: string, studentId: string) => {
    const client = getSupabaseServerClient();

    const [student, medical, allergies, latestGrowth] = await Promise.all([
      client
        .from('students')
        .select('id, full_name, student_code, date_of_birth')
        .eq('school_id', schoolId)
        .eq('id', studentId)
        .single(),
      client
        .from('student_medical_records')
        .select('*')
        .eq('school_id', schoolId)
        .eq('student_id', studentId)
        .maybeSingle(),
      client
        .from('student_allergies')
        .select('*')
        .eq('school_id', schoolId)
        .eq('student_id', studentId),
      client
        .from('health_growth_records')
        .select('*')
        .eq('school_id', schoolId)
        .eq('student_id', studentId)
        .order('record_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (student.error) {
      throw student.error;
    }

    return {
      student: student.data,
      medical: medical.data,
      allergies: allergies.data ?? [],
      latestGrowth: latestGrowth.data,
    };
  },
);

export const loadParentStudentHealth = cache(
  async (schoolId: string, studentId: string) => {
    const [profile, vaccinations, growth, incidents, medications] =
      await Promise.all([
        loadStudentHealthProfile(schoolId, studentId),
        loadVaccinations(schoolId, studentId),
        loadGrowthRecords(schoolId, studentId),
        loadHealthIncidents(schoolId, studentId),
        loadHealthMedications(schoolId, studentId),
      ]);

    return {
      ...profile,
      vaccinations,
      growth,
      incidents,
      medications: medications.filter((med) => med.is_active),
    };
  },
);

export const loadStudentHealthSummaries = cache(async (schoolId: string) => {
  const client = getSupabaseServerClient();

  const { data: students, error } = await client
    .from('students')
    .select('id, full_name, student_code')
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .order('full_name');

  if (error) {
    throw error;
  }

  const { data: allergies } = await client
    .from('student_allergies')
    .select('student_id')
    .eq('school_id', schoolId);

  const allergyCountByStudent = new Map<string, number>();

  for (const row of allergies ?? []) {
    allergyCountByStudent.set(
      row.student_id,
      (allergyCountByStudent.get(row.student_id) ?? 0) + 1,
    );
  }

  const { data: latestGrowth } = await client
    .from('health_growth_records')
    .select('student_id, height_cm, weight_kg, bmi, record_date')
    .eq('school_id', schoolId)
    .order('record_date', { ascending: false });

  const latestByStudent = new Map<
    string,
    {
      student_id: string;
      height_cm: number | null;
      weight_kg: number | null;
      bmi: number | null;
      record_date: string;
    }
  >();

  for (const row of latestGrowth ?? []) {
    if (!latestByStudent.has(row.student_id)) {
      latestByStudent.set(row.student_id, row);
    }
  }

  return (students ?? []).map((student) => {
    const growth = latestByStudent.get(student.id);

    return {
      studentId: student.id,
      fullName: student.full_name,
      studentCode: student.student_code,
      allergyCount: allergyCountByStudent.get(student.id) ?? 0,
      latestBmi: growth?.bmi ? Number(growth.bmi) : null,
      latestHeightCm: growth?.height_cm ? Number(growth.height_cm) : null,
      latestWeightKg: growth?.weight_kg ? Number(growth.weight_kg) : null,
    } satisfies StudentHealthSummary;
  });
});

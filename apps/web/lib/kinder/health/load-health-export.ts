import 'server-only';

import { cache } from 'react';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import type {
  HealthGrowthRecord,
  HealthIncident,
  HealthMedicalCheckup,
  HealthMedication,
  HealthVaccination,
  StudentHealthSummary,
  StudentOption,
} from './types';
import { loadStudentHealthSummaries } from './load-health';

export type HealthExportBundle = {
  students: StudentOption[];
  profiles: StudentHealthSummary[];
  growth: HealthGrowthRecord[];
  vaccinations: HealthVaccination[];
  checkups: HealthMedicalCheckup[];
  medications: HealthMedication[];
  incidents: HealthIncident[];
};

export const loadHealthExportBundle = cache(
  async (schoolId: string, studentId?: string): Promise<HealthExportBundle> => {
    const client = getSupabaseServerClient();

    const studentsQuery = client
      .from('students')
      .select('id, full_name, student_code')
      .eq('school_id', schoolId)
      .is('deleted_at', null)
      .order('full_name');

    const growthQuery = client
      .from('health_growth_records')
      .select('*')
      .eq('school_id', schoolId)
      .order('record_date', { ascending: false });

    const vaccinationsQuery = client
      .from('health_vaccinations')
      .select('*')
      .eq('school_id', schoolId)
      .order('administered_on', { ascending: false });

    const checkupsQuery = client
      .from('health_medical_checkups')
      .select('*')
      .eq('school_id', schoolId)
      .order('checkup_date', { ascending: false });

    const medicationsQuery = client
      .from('health_medications')
      .select('*')
      .eq('school_id', schoolId)
      .order('start_date', { ascending: false });

    const incidentsQuery = client
      .from('health_incidents')
      .select('*')
      .eq('school_id', schoolId)
      .order('incident_date', { ascending: false });

    if (studentId) {
      growthQuery.eq('student_id', studentId);
      vaccinationsQuery.eq('student_id', studentId);
      checkupsQuery.eq('student_id', studentId);
      medicationsQuery.eq('student_id', studentId);
      incidentsQuery.eq('student_id', studentId);
    }

    const [
      studentsResult,
      profiles,
      growthResult,
      vaccinationsResult,
      checkupsResult,
      medicationsResult,
      incidentsResult,
    ] = await Promise.all([
      studentsQuery,
      loadStudentHealthSummaries(schoolId),
      growthQuery,
      vaccinationsQuery,
      checkupsQuery,
      medicationsQuery,
      incidentsQuery,
    ]);

    if (studentsResult.error) {
      throw studentsResult.error;
    }
    if (growthResult.error) {
      throw growthResult.error;
    }
    if (vaccinationsResult.error) {
      throw vaccinationsResult.error;
    }
    if (checkupsResult.error) {
      throw checkupsResult.error;
    }
    if (medicationsResult.error) {
      throw medicationsResult.error;
    }
    if (incidentsResult.error) {
      throw incidentsResult.error;
    }

    const filteredProfiles = studentId
      ? profiles.filter((profile) => profile.studentId === studentId)
      : profiles;

    return {
      students: (studentsResult.data ?? []) as StudentOption[],
      profiles: filteredProfiles,
      growth: (growthResult.data ?? []) as HealthGrowthRecord[],
      vaccinations: (vaccinationsResult.data ?? []) as HealthVaccination[],
      checkups: (checkupsResult.data ?? []) as HealthMedicalCheckup[],
      medications: (medicationsResult.data ?? []) as HealthMedication[],
      incidents: (incidentsResult.data ?? []) as HealthIncident[],
    };
  },
);

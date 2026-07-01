import type { Database } from '~/lib/database.types';

export type HealthGrowthRecord =
  Database['public']['Tables']['health_growth_records']['Row'];

export type HealthVaccination =
  Database['public']['Tables']['health_vaccinations']['Row'];

export type HealthMedicalCheckup =
  Database['public']['Tables']['health_medical_checkups']['Row'];

export type HealthMedication =
  Database['public']['Tables']['health_medications']['Row'];

export type HealthIncident =
  Database['public']['Tables']['health_incidents']['Row'];

export type HealthIncidentSeverity =
  Database['public']['Enums']['health_incident_severity'];

export type HealthIncidentType =
  Database['public']['Enums']['health_incident_type'];

export type StudentHealthSummary = {
  studentId: string;
  fullName: string;
  studentCode: string;
  allergyCount: number;
  latestBmi: number | null;
  latestHeightCm: number | null;
  latestWeightKg: number | null;
};

export type HealthDashboardSummary = {
  totalStudents: number;
  studentsWithAllergies: number;
  vaccinationsDueSoon: number;
  incidentsThisMonth: number;
  growthRecordsThisMonth: number;
  activeMedications: number;
};

export type StudentOption = {
  id: string;
  full_name: string;
  student_code: string;
};

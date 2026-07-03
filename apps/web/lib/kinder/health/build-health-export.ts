import type {
  HealthGrowthRecord,
  HealthIncident,
  HealthMedicalCheckup,
  HealthMedication,
  HealthVaccination,
  StudentHealthSummary,
  StudentOption,
} from './types';
import type { HealthExportBundle } from './load-health-export';

export type HealthExportKind =
  | 'profiles'
  | 'growth'
  | 'vaccinations'
  | 'checkups'
  | 'medications'
  | 'incidents';

function studentLabel(
  studentMap: Map<string, StudentOption>,
  studentId: string,
) {
  const student = studentMap.get(studentId);

  if (!student) {
    return { name: '', code: '' };
  }

  return { name: student.full_name, code: student.student_code };
}

export function buildHealthExportCsv(
  kind: HealthExportKind,
  bundle: HealthExportBundle,
): { headers: string[]; rows: Array<Array<string | number | null | undefined>> } {
  const studentMap = new Map(bundle.students.map((student) => [student.id, student]));

  switch (kind) {
    case 'profiles':
      return buildProfilesCsv(bundle.profiles);
    case 'growth':
      return buildGrowthCsv(bundle.growth, studentMap);
    case 'vaccinations':
      return buildVaccinationsCsv(bundle.vaccinations, studentMap);
    case 'checkups':
      return buildCheckupsCsv(bundle.checkups, studentMap);
    case 'medications':
      return buildMedicationsCsv(bundle.medications, studentMap);
    case 'incidents':
      return buildIncidentsCsv(bundle.incidents, studentMap);
  }
}

function buildProfilesCsv(profiles: StudentHealthSummary[]) {
  return {
    headers: [
      'Student code',
      'Student name',
      'Allergy count',
      'Latest height (cm)',
      'Latest weight (kg)',
      'Latest BMI',
    ],
    rows: profiles.map((profile) => [
      profile.studentCode,
      profile.fullName,
      profile.allergyCount,
      profile.latestHeightCm,
      profile.latestWeightKg,
      profile.latestBmi,
    ]),
  };
}

function buildGrowthCsv(
  records: HealthGrowthRecord[],
  studentMap: Map<string, StudentOption>,
) {
  return {
    headers: [
      'Student code',
      'Student name',
      'Record date',
      'Height (cm)',
      'Weight (kg)',
      'BMI',
      'Notes',
    ],
    rows: records.map((record) => {
      const student = studentLabel(studentMap, record.student_id);

      return [
        student.code,
        student.name,
        record.record_date,
        record.height_cm,
        record.weight_kg,
        record.bmi,
        record.notes,
      ];
    }),
  };
}

function buildVaccinationsCsv(
  vaccinations: HealthVaccination[],
  studentMap: Map<string, StudentOption>,
) {
  return {
    headers: [
      'Student code',
      'Student name',
      'Vaccine name',
      'Dose number',
      'Administered on',
      'Next due on',
      'Notes',
    ],
    rows: vaccinations.map((row) => {
      const student = studentLabel(studentMap, row.student_id);

      return [
        student.code,
        student.name,
        row.vaccine_name,
        row.dose_number,
        row.administered_on,
        row.next_due_on,
        row.notes,
      ];
    }),
  };
}

function buildCheckupsCsv(
  checkups: HealthMedicalCheckup[],
  studentMap: Map<string, StudentOption>,
) {
  return {
    headers: [
      'Student code',
      'Student name',
      'Checkup date',
      'Checkup type',
      'Doctor name',
      'Height (cm)',
      'Weight (kg)',
      'Vision',
      'Hearing',
      'Dental',
      'Notes',
    ],
    rows: checkups.map((row) => {
      const student = studentLabel(studentMap, row.student_id);

      return [
        student.code,
        student.name,
        row.checkup_date,
        row.checkup_type,
        row.doctor_name,
        row.height_cm,
        row.weight_kg,
        row.vision_result,
        row.hearing_result,
        row.dental_result,
        row.notes,
      ];
    }),
  };
}

function buildMedicationsCsv(
  medications: HealthMedication[],
  studentMap: Map<string, StudentOption>,
) {
  return {
    headers: [
      'Student code',
      'Student name',
      'Medication name',
      'Dosage',
      'Frequency',
      'Start date',
      'End date',
      'Active',
      'Instructions',
    ],
    rows: medications.map((row) => {
      const student = studentLabel(studentMap, row.student_id);

      return [
        student.code,
        student.name,
        row.name,
        row.dosage,
        row.frequency,
        row.start_date,
        row.end_date,
        row.is_active ? 'yes' : 'no',
        row.instructions,
      ];
    }),
  };
}

function buildIncidentsCsv(
  incidents: HealthIncident[],
  studentMap: Map<string, StudentOption>,
) {
  return {
    headers: [
      'Student code',
      'Student name',
      'Incident date',
      'Incident time',
      'Type',
      'Severity',
      'Description',
      'Treatment',
      'Parent notified at',
    ],
    rows: incidents.map((row) => {
      const student = studentLabel(studentMap, row.student_id);

      return [
        student.code,
        student.name,
        row.incident_date,
        row.incident_time,
        row.incident_type,
        row.severity,
        row.description,
        row.treatment,
        row.parent_notified_at,
      ];
    }),
  };
}

export function healthExportFilename(kind: HealthExportKind) {
  const date = new Date().toISOString().slice(0, 10);
  return `health-${kind}-${date}.csv`;
}

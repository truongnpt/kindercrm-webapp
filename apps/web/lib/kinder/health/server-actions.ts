'use server';

import { revalidatePath } from 'next/cache';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { createUserNotification } from '~/lib/kinder/notifications/load-notifications';

import { calculateBmi } from './bmi';
import {
  CreateHealthIncidentSchema,
  NotifyParentIncidentSchema,
  UpsertGrowthRecordSchema,
  UpsertHealthMedicationSchema,
  UpsertMedicalCheckupSchema,
  UpsertVaccinationSchema,
} from './schemas/health.schema';

const HEALTH_PATH = pathsConfig.app.health;
const PARENT_PATH = pathsConfig.parent.home;

function revalidateHealthPaths(studentId?: string) {
  revalidatePath(HEALTH_PATH);
  revalidatePath(pathsConfig.app.students);

  if (studentId) {
    revalidatePath(`${pathsConfig.parent.child}/${studentId}`);
  }

  revalidatePath(PARENT_PATH);
}

/** HEALTH-003/004/005 Growth + BMI */
export const upsertGrowthRecordAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const bmi = calculateBmi(data.heightCm, data.weightKg);

    const payload = {
      school_id: data.schoolId,
      student_id: data.studentId,
      record_date: data.recordDate,
      height_cm: data.heightCm ?? null,
      weight_kg: data.weightKg ?? null,
      bmi,
      notes: data.notes || null,
      recorded_by: user.id,
    };

    const { error } = data.id
      ? await client
          .from('health_growth_records')
          .update(payload)
          .eq('id', data.id)
      : await client.from('health_growth_records').insert(payload);

    if (error) {
      throw error;
    }

    revalidateHealthPaths(data.studentId);
    return { success: true, bmi };
  },
  { schema: UpsertGrowthRecordSchema },
);

/** HEALTH-002 Vaccination */
export const upsertVaccinationAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const payload = {
      school_id: data.schoolId,
      student_id: data.studentId,
      vaccine_name: data.vaccineName,
      dose_number: data.doseNumber,
      administered_on: data.administeredOn,
      next_due_on: data.nextDueOn || null,
      provider: data.provider || null,
      notes: data.notes || null,
    };

    const { error } = data.id
      ? await client.from('health_vaccinations').update(payload).eq('id', data.id)
      : await client.from('health_vaccinations').insert(payload);

    if (error) {
      throw error;
    }

    revalidateHealthPaths(data.studentId);
    return { success: true };
  },
  { schema: UpsertVaccinationSchema },
);

/** HEALTH-006 Medical checkup */
export const upsertMedicalCheckupAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const payload = {
      school_id: data.schoolId,
      student_id: data.studentId,
      checkup_date: data.checkupDate,
      checkup_type: data.checkupType,
      height_cm: data.heightCm ?? null,
      weight_kg: data.weightKg ?? null,
      vision_result: data.visionResult || null,
      hearing_result: data.hearingResult || null,
      dental_result: data.dentalResult || null,
      doctor_name: data.doctorName || null,
      notes: data.notes || null,
    };

    const { error } = data.id
      ? await client
          .from('health_medical_checkups')
          .update(payload)
          .eq('id', data.id)
      : await client.from('health_medical_checkups').insert(payload);

    if (error) {
      throw error;
    }

    revalidateHealthPaths(data.studentId);
    return { success: true };
  },
  { schema: UpsertMedicalCheckupSchema },
);

/** HEALTH-007 Medication plan */
export const upsertHealthMedicationAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const payload = {
      school_id: data.schoolId,
      student_id: data.studentId,
      name: data.name,
      dosage: data.dosage || null,
      frequency: data.frequency || null,
      start_date: data.startDate,
      end_date: data.endDate || null,
      instructions: data.instructions || null,
      is_active: data.isActive,
    };

    const { error } = data.id
      ? await client.from('health_medications').update(payload).eq('id', data.id)
      : await client.from('health_medications').insert(payload);

    if (error) {
      throw error;
    }

    revalidateHealthPaths(data.studentId);
    return { success: true };
  },
  { schema: UpsertHealthMedicationSchema },
);

/** HEALTH-009 Incident report */
export const createHealthIncidentAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: incident, error } = await client
      .from('health_incidents')
      .insert({
        school_id: data.schoolId,
        student_id: data.studentId,
        incident_date: data.incidentDate,
        incident_time: data.incidentTime || null,
        incident_type: data.incidentType,
        severity: data.severity,
        description: data.description,
        treatment: data.treatment || null,
        parent_notified_at: data.notifyParent
          ? new Date().toISOString()
          : null,
        reported_by: user.id,
      })
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    if (data.notifyParent && incident?.id) {
      const { data: student } = await client
        .from('students')
        .select('full_name')
        .eq('id', data.studentId)
        .single();

      const { data: links } = await client
        .from('parent_student_links')
        .select('user_id')
        .eq('school_id', data.schoolId)
        .eq('student_id', data.studentId);

      await Promise.all(
        (links ?? []).map((link) =>
          createUserNotification({
            schoolId: data.schoolId,
            userId: link.user_id,
            category: 'system',
            title: `Sự cố y tế: ${student?.full_name ?? 'Học sinh'}`,
            body: data.description.slice(0, 200),
            linkUrl: `${pathsConfig.parent.child}/${data.studentId}`,
            referenceType: 'health_incident',
            referenceId: incident.id,
          }),
        ),
      );
    }

    revalidateHealthPaths(data.studentId);
    return { success: true, incidentId: incident?.id };
  },
  { schema: CreateHealthIncidentSchema },
);

export const notifyParentIncidentAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: incident, error: fetchError } = await client
      .from('health_incidents')
      .select('id, student_id, description')
      .eq('id', data.incidentId)
      .eq('school_id', data.schoolId)
      .single();

    if (fetchError || !incident) {
      throw new Error('Incident not found');
    }

    const { data: student } = await client
      .from('students')
      .select('full_name')
      .eq('id', incident.student_id)
      .single();

    const { data: links } = await client
      .from('parent_student_links')
      .select('user_id')
      .eq('school_id', data.schoolId)
      .eq('student_id', incident.student_id);

    await Promise.all(
      (links ?? []).map((link) =>
        createUserNotification({
          schoolId: data.schoolId,
          userId: link.user_id,
          category: 'system',
          title: `Sự cố y tế: ${student?.full_name ?? 'Học sinh'}`,
          body: incident.description.slice(0, 200),
          linkUrl: `${pathsConfig.parent.child}/${incident.student_id}`,
          referenceType: 'health_incident',
          referenceId: incident.id,
        }),
      ),
    );

    const { error } = await client
      .from('health_incidents')
      .update({ parent_notified_at: new Date().toISOString() })
      .eq('id', data.incidentId);

    if (error) {
      throw error;
    }

    revalidateHealthPaths(incident.student_id);
    return { success: true };
  },
  { schema: NotifyParentIncidentSchema },
);

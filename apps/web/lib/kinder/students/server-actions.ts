'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';
import { getPackageLimits, getSchoolUsage } from '~/lib/kinder/subscription/quotas';
import type { Package } from '~/lib/kinder/types';

import { generateStudentCode } from './generate-student-code';
import { countStudents } from './load-students';
import {
  ConvertLeadSchema,
  CreateAllergySchema,
  CreateEmergencyContactSchema,
  CreateParentSchema,
  CreatePickupPersonSchema,
  CreateStudentSchema,
  DeleteStudentSchema,
  UpdateStudentSchema,
  UpdateStudentStatusSchema,
  UpsertMedicalRecordSchema,
} from './schemas/student.schema';
import { ImportStudentsSchema } from './schemas/import.schema';

const STUDENTS_PATH = pathsConfig.app.students;

function revalidateStudentPaths(studentId?: string) {
  revalidatePath(STUDENTS_PATH);
  revalidatePath(pathsConfig.app.home);

  if (studentId) {
    revalidatePath(`${pathsConfig.app.studentDetail}/${studentId}`);
  }
}

async function logStudentTimeline(
  params: {
    studentId: string;
    schoolId: string;
    eventType:
      | 'created'
      | 'updated'
      | 'status_changed'
      | 'class_transfer'
      | 'graduated'
      | 'note'
      | 'parent_added'
      | 'medical_updated';
    description?: string;
    metadata?: Record<string, unknown>;
    userId: string;
  },
) {
  const client = getSupabaseServerClient();

  await client.from('student_timeline').insert({
    student_id: params.studentId,
    school_id: params.schoolId,
    event_type: params.eventType,
    description: params.description ?? null,
    metadata: params.metadata ?? {},
    created_by: params.userId,
  });
}

async function getPackageForSchool(schoolId: string) {
  const client = getSupabaseServerClient();

  const { data } = await client
    .from('school_subscriptions')
    .select('package:packages (*)')
    .eq('school_id', schoolId)
    .maybeSingle();

  return (data?.package as Package | null) ?? null;
}

/** STUDENT-001 Create student */
export const createStudentAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const pkg = await getPackageForSchool(data.schoolId);

    await assertStudentQuota(client, data.schoolId, pkg);

    const total = await countStudents(data.schoolId);
    const studentCode =
      data.studentCode ||
      generateStudentCode(data.schoolId, total + 1);

    const { data: student, error } = await client
      .from('students')
      .insert({
        school_id: data.schoolId,
        campus_id: data.campusId || null,
        student_code: studentCode,
        full_name: data.fullName,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || null,
        class_name: data.className || null,
        enrollment_date: data.enrollmentDate || new Date().toISOString().slice(0, 10),
        notes: data.notes || null,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (error || !student) {
      throw error ?? new Error('Failed to create student');
    }

    if (data.parentName) {
      await client.from('student_parents').insert({
        student_id: student.id,
        school_id: data.schoolId,
        full_name: data.parentName,
        phone: data.parentPhone || null,
        email: data.parentEmail || null,
        is_primary: true,
        relationship: 'guardian',
      });
    }

    await logStudentTimeline({
      studentId: student.id,
      schoolId: data.schoolId,
      eventType: 'created',
      description: `Học sinh ${data.fullName} đã được tạo`,
      userId: user.id,
    });

    revalidateStudentPaths(student.id);
    redirect(`${pathsConfig.app.studentDetail}/${student.id}`);
  },
  { schema: CreateStudentSchema },
);

/** STUDENT-002 Update profile */
export const updateStudentAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { data: existing } = await client
      .from('students')
      .select('status, class_name')
      .eq('id', data.studentId)
      .eq('school_id', data.schoolId)
      .single();

    const { error } = await client
      .from('students')
      .update({
        campus_id: data.campusId || null,
        full_name: data.fullName,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || null,
        class_name: data.className || null,
        enrollment_date: data.enrollmentDate || null,
        status: data.status,
        notes: data.notes || null,
        photo_url: data.photoUrl || null,
      })
      .eq('id', data.studentId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    if (existing?.status !== data.status) {
      await logStudentTimeline({
        studentId: data.studentId,
        schoolId: data.schoolId,
        eventType: 'status_changed',
        description: `Trạng thái: ${existing?.status} → ${data.status}`,
        userId: user.id,
      });
    }

    if (
      existing?.class_name !== data.className &&
      data.className
    ) {
      await logStudentTimeline({
        studentId: data.studentId,
        schoolId: data.schoolId,
        eventType: 'class_transfer',
        description: `Chuyển lớp: ${existing?.class_name ?? '—'} → ${data.className}`,
        userId: user.id,
      });
    }

    revalidateStudentPaths(data.studentId);
    return { success: true };
  },
  { schema: UpdateStudentSchema },
);

/** STUDENT-009 / STUDENT-010 Status change */
export const updateStudentStatusAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('students')
      .update({
        status: data.status,
        class_name: data.className || undefined,
      })
      .eq('id', data.studentId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    const eventType =
      data.status === 'graduated' ? 'graduated' : 'status_changed';

    await logStudentTimeline({
      studentId: data.studentId,
      schoolId: data.schoolId,
      eventType,
      description: `Cập nhật trạng thái: ${data.status}`,
      userId: user.id,
    });

    revalidateStudentPaths(data.studentId);
    return { success: true };
  },
  { schema: UpdateStudentStatusSchema },
);

/** Soft delete student */
export const deleteStudentAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('students')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'withdrawn',
      })
      .eq('id', data.studentId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateStudentPaths();
    redirect(STUDENTS_PATH);
  },
  { schema: DeleteStudentSchema },
);

/** CRM-014 Convert lead to student */
export const convertLeadToStudentAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const pkg = await getPackageForSchool(data.schoolId);

    await assertStudentQuota(client, data.schoolId, pkg);

    const { data: lead, error: leadError } = await client
      .from('leads')
      .select('*')
      .eq('id', data.leadId)
      .eq('school_id', data.schoolId)
      .is('deleted_at', null)
      .single();

    if (leadError || !lead) {
      throw new KinderError(
        KINDER_ERROR_CODES.LEAD_NOT_FOUND,
        'Lead not found',
      );
    }

    const { data: existingStudent } = await client
      .from('students')
      .select('id')
      .eq('lead_id', data.leadId)
      .maybeSingle();

    if (existingStudent) {
      redirect(`${pathsConfig.app.studentDetail}/${existingStudent.id}`);
    }

    const total = await countStudents(data.schoolId);
    const studentCode = generateStudentCode(data.schoolId, total + 1);

    const { data: student, error } = await client
      .from('students')
      .insert({
        school_id: data.schoolId,
        campus_id: lead.campus_id,
        lead_id: lead.id,
        student_code: studentCode,
        full_name: lead.child_name || lead.parent_name,
        date_of_birth: lead.child_dob,
        enrollment_date: new Date().toISOString().slice(0, 10),
        notes: lead.notes,
        created_by: user.id,
      })
      .select('id')
      .single();

    if (error || !student) {
      throw error ?? new Error('Failed to convert lead');
    }

    await client.from('student_parents').insert({
      student_id: student.id,
      school_id: data.schoolId,
      full_name: lead.parent_name,
      phone: lead.phone,
      email: lead.email,
      is_primary: true,
      relationship: 'guardian',
    });

    await client
      .from('leads')
      .update({ stage: 'enrolled', status: 'won' })
      .eq('id', lead.id);

    await client.from('lead_activities').insert({
      lead_id: lead.id,
      school_id: data.schoolId,
      activity_type: 'enrollment',
      description: 'Chuyển thành học sinh',
      created_by: user.id,
    });

    await logStudentTimeline({
      studentId: student.id,
      schoolId: data.schoolId,
      eventType: 'created',
      description: `Chuyển từ lead: ${lead.parent_name}`,
      metadata: { leadId: lead.id },
      userId: user.id,
    });

    revalidatePath(pathsConfig.app.crm);
    revalidateStudentPaths(student.id);
    redirect(`${pathsConfig.app.studentDetail}/${student.id}`);
  },
  { schema: ConvertLeadSchema },
);

export const createParentAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    if (data.isPrimary) {
      await client
        .from('student_parents')
        .update({ is_primary: false })
        .eq('student_id', data.studentId);
    }

    const { error } = await client.from('student_parents').insert({
      student_id: data.studentId,
      school_id: data.schoolId,
      full_name: data.fullName,
      phone: data.phone || null,
      email: data.email || null,
      relationship: data.relationship,
      is_primary: data.isPrimary,
      address: data.address || null,
    });

    if (error) {
      throw error;
    }

    await logStudentTimeline({
      studentId: data.studentId,
      schoolId: data.schoolId,
      eventType: 'parent_added',
      description: `Thêm phụ huynh: ${data.fullName}`,
      userId: user.id,
    });

    revalidateStudentPaths(data.studentId);
    return { success: true };
  },
  { schema: CreateParentSchema },
);

export const createEmergencyContactAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('student_emergency_contacts').insert({
      student_id: data.studentId,
      school_id: data.schoolId,
      full_name: data.fullName,
      phone: data.phone,
      relationship: data.relationship || null,
    });

    if (error) {
      throw error;
    }

    revalidateStudentPaths(data.studentId);
    return { success: true };
  },
  { schema: CreateEmergencyContactSchema },
);

export const upsertMedicalRecordAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('student_medical_records').upsert({
      student_id: data.studentId,
      school_id: data.schoolId,
      blood_type: data.bloodType || null,
      conditions: data.conditions || null,
      medications: data.medications || null,
      doctor_name: data.doctorName || null,
      doctor_phone: data.doctorPhone || null,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }

    await logStudentTimeline({
      studentId: data.studentId,
      schoolId: data.schoolId,
      eventType: 'medical_updated',
      description: 'Cập nhật hồ sơ y tế',
      userId: user.id,
    });

    revalidateStudentPaths(data.studentId);
    return { success: true };
  },
  { schema: UpsertMedicalRecordSchema },
);

export const createAllergyAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('student_allergies').insert({
      student_id: data.studentId,
      school_id: data.schoolId,
      allergen: data.allergen,
      severity: data.severity || null,
      notes: data.notes || null,
    });

    if (error) {
      throw error;
    }

    await logStudentTimeline({
      studentId: data.studentId,
      schoolId: data.schoolId,
      eventType: 'medical_updated',
      description: `Thêm dị ứng: ${data.allergen}`,
      userId: user.id,
    });

    revalidateStudentPaths(data.studentId);
    return { success: true };
  },
  { schema: CreateAllergySchema },
);

export const createPickupPersonAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('student_pickup_persons').insert({
      student_id: data.studentId,
      school_id: data.schoolId,
      full_name: data.fullName,
      phone: data.phone || null,
      id_number: data.idNumber || null,
      relationship: data.relationship || null,
    });

    if (error) {
      throw error;
    }

    revalidateStudentPaths(data.studentId);
    return { success: true };
  },
  { schema: CreatePickupPersonSchema },
);

/** STUDENT-014 Import students from CSV */
export const importStudentsAction = enhanceAction(
  async (data, user) => {
    const client = getSupabaseServerClient();
    const pkg = await getPackageForSchool(data.schoolId);
    const usage = await getSchoolUsage(client, data.schoolId);
    const limits = getPackageLimits(pkg);

    if (usage.students + data.students.length > limits.maxStudents) {
      throw new KinderError(
        KINDER_ERROR_CODES.STUDENT_LIMIT_REACHED,
        'Student limit reached for current package',
      );
    }

    let imported = 0;
    const errors: string[] = [];
    const existingCount = await countStudents(data.schoolId);

    for (const [index, row] of data.students.entries()) {
      try {
        const studentCode =
          row.studentCode ||
          generateStudentCode(data.schoolId, existingCount + imported + 1);

        const { data: student, error } = await client
          .from('students')
          .insert({
            school_id: data.schoolId,
            student_code: studentCode,
            full_name: row.fullName,
            date_of_birth: row.dateOfBirth || null,
            gender: row.gender || null,
            class_name: row.className || null,
            enrollment_date:
              row.enrollmentDate || new Date().toISOString().slice(0, 10),
            notes: row.notes || null,
            created_by: user.id,
          })
          .select('id')
          .single();

        if (error || !student) {
          throw error ?? new Error('Insert failed');
        }

        if (row.parentName) {
          await client.from('student_parents').insert({
            student_id: student.id,
            school_id: data.schoolId,
            full_name: row.parentName,
            phone: row.parentPhone || null,
            email: row.parentEmail || null,
            relationship: 'guardian',
            is_primary: true,
          });
        }

        await logStudentTimeline({
          studentId: student.id,
          schoolId: data.schoolId,
          eventType: 'created',
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

    revalidateStudentPaths();

    return { success: true, imported, failed: errors.length, errors };
  },
  { schema: ImportStudentsSchema },
);

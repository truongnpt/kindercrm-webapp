'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import {
  ArchiveClassSchema,
  AssignTeacherSchema,
  CreateClassroomSchema,
  CreateClassSchema,
  CreateScheduleSchema,
  CreateSchoolYearSchema,
  CreateSemesterSchema,
  EnrollStudentSchema,
  TransferStudentSchema,
  UpdateClassSchema,
} from './schemas/class.schema';

const CLASSES_PATH = pathsConfig.app.classes;

function revalidateClassPaths(classId?: string) {
  revalidatePath(CLASSES_PATH);
  revalidatePath(pathsConfig.app.students);

  if (classId) {
    revalidatePath(`${pathsConfig.app.classDetail}/${classId}`);
  }
}

async function getActiveEnrollmentCount(classId: string) {
  const client = getSupabaseServerClient();

  const { count } = await client
    .from('class_enrollments')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classId)
    .eq('status', 'active');

  return count ?? 0;
}

async function assertClassCapacity(classId: string, capacity: number) {
  const count = await getActiveEnrollmentCount(classId);

  if (count >= capacity) {
    throw new KinderError(
      KINDER_ERROR_CODES.CLASS_CAPACITY_REACHED,
      'Class is at full capacity',
    );
  }
}

export const createSchoolYearAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    if (data.isCurrent) {
      await client
        .from('school_years')
        .update({ is_current: false })
        .eq('school_id', data.schoolId);
    }

    const { error } = await client.from('school_years').insert({
      school_id: data.schoolId,
      name: data.name,
      start_date: data.startDate,
      end_date: data.endDate,
      is_current: data.isCurrent,
    });

    if (error) {
      throw error;
    }

    revalidateClassPaths();
    return { success: true };
  },
  { schema: CreateSchoolYearSchema },
);

export const createSemesterAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('semesters').insert({
      school_id: data.schoolId,
      school_year_id: data.schoolYearId,
      name: data.name,
      start_date: data.startDate,
      end_date: data.endDate,
      sort_order: data.sortOrder,
    });

    if (error) {
      throw error;
    }

    revalidateClassPaths();
    return { success: true };
  },
  { schema: CreateSemesterSchema },
);

export const createClassroomAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('classrooms').insert({
      school_id: data.schoolId,
      campus_id: data.campusId || null,
      name: data.name,
      capacity: data.capacity,
    });

    if (error) {
      throw error;
    }

    revalidateClassPaths();
    return { success: true };
  },
  { schema: CreateClassroomSchema },
);

/** CLASS-004 Create class */
export const createClassAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: cls, error } = await client
      .from('classes')
      .insert({
        school_id: data.schoolId,
        school_year_id: data.schoolYearId,
        semester_id: data.semesterId || null,
        campus_id: data.campusId || null,
        classroom_id: data.classroomId || null,
        name: data.name,
        code: data.code,
        capacity: data.capacity,
        teacher_user_id: data.teacherUserId || null,
      })
      .select('id')
      .single();

    if (error || !cls) {
      throw error ?? new Error('Failed to create class');
    }

    revalidateClassPaths(cls.id);
    redirect(`${pathsConfig.app.classDetail}/${cls.id}`);
  },
  { schema: CreateClassSchema },
);

export const updateClassAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('classes')
      .update({
        name: data.name,
        code: data.code,
        capacity: data.capacity,
        semester_id: data.semesterId || null,
        classroom_id: data.classroomId || null,
        teacher_user_id: data.teacherUserId || null,
      })
      .eq('id', data.classId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateClassPaths(data.classId);
    return { success: true };
  },
  { schema: UpdateClassSchema },
);

/** CLASS-010 Archive */
export const archiveClassAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('classes')
      .update({
        status: 'archived',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', data.classId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateClassPaths();
    redirect(CLASSES_PATH);
  },
  { schema: ArchiveClassSchema },
);

/** CLASS-005 Assign teacher */
export const assignTeacherAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client
      .from('classes')
      .update({ teacher_user_id: data.teacherUserId || null })
      .eq('id', data.classId)
      .eq('school_id', data.schoolId);

    if (error) {
      throw error;
    }

    revalidateClassPaths(data.classId);
    return { success: true };
  },
  { schema: AssignTeacherSchema },
);

/** CLASS-006 Enroll student */
export const enrollStudentAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: cls, error: classError } = await client
      .from('classes')
      .select('id, name, capacity')
      .eq('id', data.classId)
      .eq('school_id', data.schoolId)
      .single();

    if (classError || !cls) {
      throw classError ?? new Error('Class not found');
    }

    await assertClassCapacity(cls.id, cls.capacity);

    const { data: existing } = await client
      .from('class_enrollments')
      .select('id, class_id')
      .eq('student_id', data.studentId)
      .eq('status', 'active')
      .maybeSingle();

    if (existing && existing.class_id !== data.classId) {
      await client
        .from('class_enrollments')
        .update({ status: 'transferred' })
        .eq('id', existing.id);
    }

    const { error: enrollError } = await client.from('class_enrollments').upsert(
      {
        school_id: data.schoolId,
        class_id: data.classId,
        student_id: data.studentId,
        status: 'active',
        enrolled_at: new Date().toISOString().slice(0, 10),
      },
      { onConflict: 'class_id,student_id' },
    );

    if (enrollError) {
      throw enrollError;
    }

    await client
      .from('students')
      .update({
        current_class_id: data.classId,
        class_name: cls.name,
      })
      .eq('id', data.studentId)
      .eq('school_id', data.schoolId);

    await client.from('student_timeline').insert({
      student_id: data.studentId,
      school_id: data.schoolId,
      event_type: 'class_transfer',
      description: `Xếp lớp: ${cls.name}`,
      metadata: { classId: data.classId },
    });

    revalidateClassPaths(data.classId);
    return { success: true };
  },
  { schema: EnrollStudentSchema },
);

/** CLASS-009 Transfer between classes */
export const transferStudentAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { data: toClass, error: toError } = await client
      .from('classes')
      .select('id, name, capacity')
      .eq('id', data.toClassId)
      .eq('school_id', data.schoolId)
      .single();

    if (toError || !toClass) {
      throw toError ?? new Error('Target class not found');
    }

    await assertClassCapacity(toClass.id, toClass.capacity);

    await client
      .from('class_enrollments')
      .update({ status: 'transferred' })
      .eq('class_id', data.fromClassId)
      .eq('student_id', data.studentId);

    await client.from('class_enrollments').upsert(
      {
        school_id: data.schoolId,
        class_id: data.toClassId,
        student_id: data.studentId,
        status: 'active',
        enrolled_at: new Date().toISOString().slice(0, 10),
      },
      { onConflict: 'class_id,student_id' },
    );

    await client
      .from('students')
      .update({
        current_class_id: data.toClassId,
        class_name: toClass.name,
      })
      .eq('id', data.studentId)
      .eq('school_id', data.schoolId);

    await client.from('student_timeline').insert({
      student_id: data.studentId,
      school_id: data.schoolId,
      event_type: 'class_transfer',
      description: `Chuyển lớp sang ${toClass.name}`,
      metadata: {
        fromClassId: data.fromClassId,
        toClassId: data.toClassId,
      },
    });

    revalidateClassPaths(data.fromClassId);
    revalidateClassPaths(data.toClassId);
    return { success: true };
  },
  { schema: TransferStudentSchema },
);

/** CLASS-008 Add schedule slot */
export const createScheduleAction = enhanceAction(
  async (data) => {
    const client = getSupabaseServerClient();

    const { error } = await client.from('class_schedules').insert({
      school_id: data.schoolId,
      class_id: data.classId,
      day_of_week: data.dayOfWeek,
      start_time: data.startTime,
      end_time: data.endTime,
      label: data.label,
    });

    if (error) {
      throw error;
    }

    revalidateClassPaths(data.classId);
    return { success: true };
  },
  { schema: CreateScheduleSchema },
);

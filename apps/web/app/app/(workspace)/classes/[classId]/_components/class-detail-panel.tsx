'use client';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import {
  CreateScheduleSchema,
  EnrollStudentSchema,
  UpdateClassSchema,
} from '~/lib/kinder/classes/schemas/class.schema';
import {
  archiveClassAction,
  assignTeacherAction,
  createScheduleAction,
  enrollStudentAction,
  updateClassAction,
} from '~/lib/kinder/classes/server-actions';
import type {
  ClassEnrollment,
  ClassGroup,
  ClassSchedule,
} from '~/lib/kinder/classes/types';

import { TransferStudentDialog } from './transfer-student-dialog';

export function ClassDetailPanel({
  cls,
  schoolId,
  enrollments,
  schedules,
  unassignedStudents,
  teachers,
  teacherName,
  allClasses,
}: {
  cls: ClassGroup;
  schoolId: string;
  enrollments: ClassEnrollment[];
  schedules: ClassSchedule[];
  unassignedStudents: Array<{
    id: string;
    full_name: string;
    student_code: string;
  }>;
  teachers: Array<{ id: string; name: string }>;
  teacherName: string | null;
  allClasses: Array<{ id: string; name: string; code: string }>;
}) {
  const { t } = useTranslation('kinder');

  const updateForm = useForm({
    resolver: zodResolver(UpdateClassSchema),
    defaultValues: {
      classId: cls.id,
      schoolId,
      name: cls.name,
      code: cls.code,
      capacity: cls.capacity,
      semesterId: cls.semester_id ?? '',
      classroomId: cls.classroom_id ?? '',
      teacherUserId: cls.teacher_user_id ?? '',
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>
          {enrollments.length}/{cls.capacity}{' '}
          <Trans i18nKey="kinder:classes.enrolled" />
        </Badge>
        <span className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:classes.teacher" />:{' '}
          {teacherName ?? t('classes.unassigned')}
        </span>
      </div>

      <Form {...updateForm}>
        <form
          className="grid max-w-2xl gap-4"
          onSubmit={updateForm.handleSubmit(async (data) => {
            const promise = updateClassAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
          })}
        >
          <FormField
            control={updateForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.name" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={updateForm.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.code" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={updateForm.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.capacity" />
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={updateForm.control}
            name="teacherUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.teacher" />
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    void assignTeacherAction({
                      classId: cls.id,
                      schoolId,
                      teacherUserId: value,
                    });
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit">
              <Trans i18nKey="kinder:classes.save" />
            </Button>
            <Button
              onClick={() => void archiveClassAction({ classId: cls.id, schoolId })}
              type="button"
              variant="destructive"
            >
              <Trans i18nKey="kinder:classes.archive" />
            </Button>
          </div>
        </form>
      </Form>

      <RosterSection
        allClasses={allClasses}
        classId={cls.id}
        enrollments={enrollments}
        schoolId={schoolId}
        unassignedStudents={unassignedStudents}
      />

      <ScheduleSection
        classId={cls.id}
        schedules={schedules}
        schoolId={schoolId}
      />
    </div>
  );
}

function RosterSection({
  classId,
  schoolId,
  enrollments,
  unassignedStudents,
  allClasses,
}: {
  classId: string;
  schoolId: string;
  enrollments: ClassEnrollment[];
  unassignedStudents: Array<{
    id: string;
    full_name: string;
    student_code: string;
  }>;
  allClasses: Array<{ id: string; name: string; code: string }>;
}) {
  const { t } = useTranslation('kinder');
  const form = useForm({
    resolver: zodResolver(EnrollStudentSchema),
    defaultValues: { classId, schoolId, studentId: '' },
  });

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        <Trans i18nKey="kinder:classes.roster" />
      </h3>

      {enrollments.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:classes.noStudents" />
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {enrollments.map((row) => (
            <li
              className="flex items-center justify-between gap-2 p-3 text-sm"
              key={row.id}
            >
              <div>
                <p className="font-medium">{row.student?.full_name}</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {row.student?.student_code}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TransferStudentDialog
                  allClasses={allClasses}
                  fromClassId={classId}
                  schoolId={schoolId}
                  studentId={row.student_id}
                  studentName={row.student?.full_name ?? ''}
                />
                <Button asChild size="sm" variant="ghost">
                  <Link
                    href={`${pathsConfig.app.studentDetail}/${row.student_id}`}
                  >
                    <Trans i18nKey="kinder:students.detail" />
                  </Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {unassignedStudents.length > 0 ? (
        <Form {...form}>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={form.handleSubmit(async (data) => {
              const promise = enrollStudentAction(data);
              toast.promise(promise, {
                loading: t('schoolSettings.saving'),
                success: t('schoolSettings.saved'),
                error: t('kinder:errors.classCapacity'),
              });
              await promise;
              form.reset({ classId, schoolId, studentId: '' });
            })}
          >
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem className="min-w-[220px] flex-1">
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.enrollStudent" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unassignedStudents.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name} ({s.student_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button type="submit">
              <Trans i18nKey="kinder:classes.enrollStudent" />
            </Button>
          </form>
        </Form>
      ) : null}
    </section>
  );
}

function ScheduleSection({
  classId,
  schoolId,
  schedules,
}: {
  classId: string;
  schoolId: string;
  schedules: ClassSchedule[];
}) {
  const { t } = useTranslation('kinder');
  const form = useForm({
    resolver: zodResolver(CreateScheduleSchema),
    defaultValues: {
      classId,
      schoolId,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:00',
      label: 'Hoạt động buổi sáng',
    },
  });

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        <Trans i18nKey="kinder:classes.timetable" />
      </h3>
      <ul className="divide-y rounded-lg border text-sm">
        {schedules.map((slot) => (
          <li className="p-3" key={slot.id}>
            <Trans i18nKey={`kinder:classes.days.${slot.day_of_week}`} /> ·{' '}
            {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)} ·{' '}
            {slot.label}
          </li>
        ))}
      </ul>
      <Form {...form}>
        <form
          className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createScheduleAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
          })}
        >
          <FormField
            control={form.control}
            name="dayOfWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.day" />
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        <Trans i18nKey={`kinder:classes.days.${d}`} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.activity" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.startTime" />
                </FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.endTime" />
                </FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="sm:col-span-2">
            <Button type="submit">
              <Trans i18nKey="kinder:classes.addSlot" />
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}

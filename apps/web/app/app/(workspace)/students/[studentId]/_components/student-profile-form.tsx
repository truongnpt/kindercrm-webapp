'use client';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { UpdateStudentSchema } from '~/lib/kinder/students/schemas/student.schema';
import {
  deleteStudentAction,
  updateStudentAction,
} from '~/lib/kinder/students/server-actions';
import type { Student } from '~/lib/kinder/students/types';

import { StudentPhotoField } from '../../_components/student-photo-field';

const STATUSES = [
  'active',
  'inactive',
  'graduated',
  'transferred',
  'withdrawn',
] as const;

export function StudentProfileForm({
  student,
  schoolId,
}: {
  student: Student;
  schoolId: string;
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(UpdateStudentSchema),
    defaultValues: {
      studentId: student.id,
      schoolId,
      fullName: student.full_name,
      dateOfBirth: student.date_of_birth ?? '',
      gender: student.gender ?? undefined,
      className: student.class_name ?? '',
      enrollmentDate: student.enrollment_date ?? '',
      status: student.status,
      notes: student.notes ?? '',
      photoUrl: student.photo_url ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const promise = updateStudentAction(data);

    toast.promise(promise, {
      loading: t('schoolSettings.saving'),
      success: t('schoolSettings.saved'),
      error: t('common:genericServerError', { ns: 'common' }),
    });

    await promise;
  });

  return (
    <Form {...form}>
      <form className="grid max-w-2xl gap-4" onSubmit={onSubmit}>
        <p className="text-muted-foreground font-mono text-sm">
          {student.student_code}
        </p>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:students.fullName" />
              </FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.dateOfBirth" />
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.gender" />
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">
                      <Trans i18nKey="kinder:students.genderMale" />
                    </SelectItem>
                    <SelectItem value="female">
                      <Trans i18nKey="kinder:students.genderFemale" />
                    </SelectItem>
                    <SelectItem value="other">
                      <Trans i18nKey="kinder:students.genderOther" />
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="className"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.className" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.status" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        <Trans
                          i18nKey={`kinder:students.statuses.${status}`}
                        />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:students.photo" />
              </FormLabel>
              <FormControl>
                <StudentPhotoField
                  fullName={form.watch('fullName')}
                  onChange={field.onChange}
                  schoolId={schoolId}
                  studentId={student.id}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:students.notes" />
              </FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="submit">
            <Trans i18nKey="kinder:students.save" />
          </Button>
          {student.lead_id ? (
            <Button asChild type="button" variant="outline">
              <Link href={`${pathsConfig.app.crmLead}/${student.lead_id}`}>
                Lead
              </Link>
            </Button>
          ) : null}
          <Button
 onClick={() =>
              void deleteStudentAction({
                studentId: student.id,
                schoolId,
              })
            }
            type="button"
            variant="destructive"
          >
            <Trans i18nKey="kinder:students.delete" />
          </Button>
        </div>
      </form>
    </Form>
  );
}

'use client';

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
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { UpsertMedicalCheckupSchema } from '~/lib/kinder/health/schemas/health.schema';
import { upsertMedicalCheckupAction } from '~/lib/kinder/health/server-actions';
import type { HealthMedicalCheckup, StudentOption } from '~/lib/kinder/health/types';

import { HealthStudentFilter } from './health-student-filter';

export function CheckupsPanel({
  schoolId,
  students,
  checkups,
  studentId,
}: {
  schoolId: string;
  students: StudentOption[];
  checkups: HealthMedicalCheckup[];
  studentId?: string;
}) {
  const { t } = useTranslation('kinder');
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const form = useForm({
    resolver: zodResolver(UpsertMedicalCheckupSchema),
    defaultValues: {
      schoolId,
      studentId: studentId ?? students[0]?.id ?? '',
      checkupDate: new Date().toISOString().slice(0, 10),
      checkupType: 'periodic',
      heightCm: undefined as number | undefined,
      weightKg: undefined as number | undefined,
      visionResult: '',
      hearingResult: '',
      dentalResult: '',
      doctorName: '',
      notes: '',
    },
  });

  return (
    <div className="space-y-6">
      <HealthStudentFilter studentId={studentId} students={students} tab="checkups" />

      {checkups.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:health.emptyCheckups" />
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {checkups.map((row) => (
            <li className="p-4 text-sm" key={row.id}>
              <p className="font-medium">
                {studentMap.get(row.student_id)?.full_name ?? '—'} · {row.checkup_date}
              </p>
              <p className="text-muted-foreground text-xs">
                {row.checkup_type}
                {row.doctor_name ? ` · ${row.doctor_name}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form
          className="grid max-w-xl gap-3 rounded-lg border p-4"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertMedicalCheckupAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('health.checkupSaved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              schoolId,
              studentId: data.studentId,
              checkupDate: new Date().toISOString().slice(0, 10),
              checkupType: 'periodic',
              visionResult: '',
              hearingResult: '',
              dentalResult: '',
              doctorName: '',
              notes: '',
            });
          })}
        >
          <p className="font-medium">
            <Trans i18nKey="kinder:health.addCheckup" />
          </p>
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.student" />
                </FormLabel>
                <FormControl>
                  <select
                    className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                    {...field}
                  >
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name}
                      </option>
                    ))}
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="checkupDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:health.checkupDate" />
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="doctorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:health.doctorName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.notes" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button disabled={students.length === 0} type="submit">
            <Trans i18nKey="kinder:health.addCheckup" />
          </Button>
        </form>
      </Form>
    </div>
  );
}

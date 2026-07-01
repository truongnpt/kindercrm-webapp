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

import { UpsertGrowthRecordSchema } from '~/lib/kinder/health/schemas/health.schema';
import { upsertGrowthRecordAction } from '~/lib/kinder/health/server-actions';
import type { HealthGrowthRecord, StudentOption } from '~/lib/kinder/health/types';

import { HealthStudentFilter } from './health-student-filter';

export function GrowthPanel({
  schoolId,
  students,
  records,
  studentId,
}: {
  schoolId: string;
  students: StudentOption[];
  records: HealthGrowthRecord[];
  studentId?: string;
}) {
  const { t } = useTranslation('kinder');
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const form = useForm({
    resolver: zodResolver(UpsertGrowthRecordSchema),
    defaultValues: {
      schoolId,
      studentId: studentId ?? students[0]?.id ?? '',
      recordDate: new Date().toISOString().slice(0, 10),
      heightCm: undefined as number | undefined,
      weightKg: undefined as number | undefined,
      notes: '',
    },
  });

  return (
    <div className="space-y-6">
      <HealthStudentFilter studentId={studentId} students={students} tab="growth" />

      {records.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:health.emptyGrowth" />
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {records.map((record) => (
            <li className="p-4 text-sm" key={record.id}>
              <p className="font-medium">
                {studentMap.get(record.student_id)?.full_name ?? '—'} ·{' '}
                {record.record_date}
              </p>
              <p className="text-muted-foreground text-xs">
                {record.height_cm ? `${record.height_cm} cm` : '—'} ·{' '}
                {record.weight_kg ? `${record.weight_kg} kg` : '—'} · BMI:{' '}
                {record.bmi ?? '—'}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form
          className="grid max-w-xl gap-3 rounded-lg border p-4"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertGrowthRecordAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('health.growthSaved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              schoolId,
              studentId: data.studentId,
              recordDate: new Date().toISOString().slice(0, 10),
              notes: '',
            });
          })}
        >
          <p className="font-medium">
            <Trans i18nKey="kinder:health.addGrowth" />
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
            name="recordDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:health.recordDate" />
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="heightCm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:health.heightCm" />
                  </FormLabel>
                  <FormControl>
                    <Input min={0} step="0.1" type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weightKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:health.weightKg" />
                  </FormLabel>
                  <FormControl>
                    <Input min={0} step="0.01" type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.notes" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button disabled={students.length === 0} type="submit">
            <Trans i18nKey="kinder:health.addGrowth" />
          </Button>
        </form>
      </Form>
    </div>
  );
}

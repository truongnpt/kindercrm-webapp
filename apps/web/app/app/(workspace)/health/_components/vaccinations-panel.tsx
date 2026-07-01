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

import { UpsertVaccinationSchema } from '~/lib/kinder/health/schemas/health.schema';
import { upsertVaccinationAction } from '~/lib/kinder/health/server-actions';
import type { HealthVaccination, StudentOption } from '~/lib/kinder/health/types';

import { HealthStudentFilter } from './health-student-filter';

export function VaccinationsPanel({
  schoolId,
  students,
  vaccinations,
  studentId,
}: {
  schoolId: string;
  students: StudentOption[];
  vaccinations: HealthVaccination[];
  studentId?: string;
}) {
  const { t } = useTranslation('kinder');
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const form = useForm({
    resolver: zodResolver(UpsertVaccinationSchema),
    defaultValues: {
      schoolId,
      studentId: studentId ?? students[0]?.id ?? '',
      vaccineName: '',
      doseNumber: 1,
      administeredOn: new Date().toISOString().slice(0, 10),
      nextDueOn: '',
      provider: '',
      notes: '',
    },
  });

  return (
    <div className="space-y-6">
      <HealthStudentFilter studentId={studentId} students={students} tab="vaccinations" />

      {vaccinations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:health.emptyVaccinations" />
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {vaccinations.map((row) => (
            <li className="p-4 text-sm" key={row.id}>
              <p className="font-medium">
                {studentMap.get(row.student_id)?.full_name ?? '—'} · {row.vaccine_name}
              </p>
              <p className="text-muted-foreground text-xs">
                {row.administered_on} · liều {row.dose_number}
                {row.next_due_on ? ` · tiêm nhắc: ${row.next_due_on}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form
          className="grid max-w-xl gap-3 rounded-lg border p-4"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertVaccinationAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('health.vaccinationSaved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              schoolId,
              studentId: data.studentId,
              vaccineName: '',
              doseNumber: 1,
              administeredOn: new Date().toISOString().slice(0, 10),
              nextDueOn: '',
              provider: '',
              notes: '',
            });
          })}
        >
          <p className="font-medium">
            <Trans i18nKey="kinder:health.addVaccination" />
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
            name="vaccineName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:health.vaccineName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="doseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:health.doseNumber" />
                  </FormLabel>
                  <FormControl>
                    <Input min={1} type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="administeredOn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:health.administeredOn" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="nextDueOn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:health.nextDueOn" />
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button disabled={students.length === 0} type="submit">
            <Trans i18nKey="kinder:health.addVaccination" />
          </Button>
        </form>
      </Form>
    </div>
  );
}

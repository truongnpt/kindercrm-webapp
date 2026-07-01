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

import { UpsertHealthMedicationSchema } from '~/lib/kinder/health/schemas/health.schema';
import { PanelEmpty } from '~/components/kinder-ui';
import { upsertHealthMedicationAction } from '~/lib/kinder/health/server-actions';
import type { HealthMedication, StudentOption } from '~/lib/kinder/health/types';

import { HealthStudentFilter } from './health-student-filter';

export function MedicationsPanel({
  schoolId,
  students,
  medications,
  studentId,
}: {
  schoolId: string;
  students: StudentOption[];
  medications: HealthMedication[];
  studentId?: string;
}) {
  const { t } = useTranslation('kinder');
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const form = useForm({
    resolver: zodResolver(UpsertHealthMedicationSchema),
    defaultValues: {
      schoolId,
      studentId: studentId ?? students[0]?.id ?? '',
      name: '',
      dosage: '',
      frequency: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      instructions: '',
      isActive: true,
    },
  });

  return (
    <div className="space-y-6">
      <HealthStudentFilter studentId={studentId} students={students} tab="medications" />

      {medications.length === 0 ? (
        <PanelEmpty messageKey="kinder:health.emptyMedications" />
      ) : (
        <ul className="kinder-list-panel">
          {medications.map((med) => (
            <li className="p-4 text-sm" key={med.id}>
              <p className="font-medium">
                {studentMap.get(med.student_id)?.full_name ?? '—'} · {med.name}
              </p>
              <p className="text-muted-foreground text-xs">
                {med.dosage} · {med.frequency} · {med.start_date}
                {med.end_date ? ` → ${med.end_date}` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form
          className="kinder-form-panel max-w-xl grid-cols-1"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = upsertHealthMedicationAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('health.medicationSaved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              schoolId,
              studentId: data.studentId,
              name: '',
              dosage: '',
              frequency: '',
              startDate: new Date().toISOString().slice(0, 10),
              endDate: '',
              instructions: '',
              isActive: true,
            });
          })}
        >
          <p className="font-medium">
            <Trans i18nKey="kinder:health.addMedication" />
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:health.medicationName" />
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
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:health.dosage" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:health.frequency" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:health.instructions" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button disabled={students.length === 0} type="submit">
            <Trans i18nKey="kinder:health.addMedication" />
          </Button>
        </form>
      </Form>
    </div>
  );
}

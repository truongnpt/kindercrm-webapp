'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { UpsertVaccinationSchema } from '~/lib/kinder/health/schemas/health.schema';
import { upsertVaccinationAction } from '~/lib/kinder/health/server-actions';
import type { StudentOption } from '~/lib/kinder/health/types';

export function AddVaccinationDialog({
  schoolId,
  studentId,
  students,
}: {
  schoolId: string;
  studentId?: string;
  students: StudentOption[];
}) {
  const [open, setOpen] = useState(false);

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

  const addVaccination = useKinderMutation({
    mutationFn: upsertVaccinationAction,
    invalidateKeys: [kinderQueryKeys.health(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        studentId: studentId ?? students[0]?.id ?? '',
        vaccineName: '',
        doseNumber: 1,
        administeredOn: new Date().toISOString().slice(0, 10),
        nextDueOn: '',
        provider: '',
        notes: '',
      });
      setOpen(false);
    },
  });

  if (students.length === 0) {
    return null;
  }

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:health.addVaccination" />}
      footer={
        <KinderSubmitButton
          loading={addVaccination.isPending}
          onClick={form.handleSubmit((data) => addVaccination.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:health.addVaccination" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:health.addVaccination" />}
      trigger={
        <Button size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:health.addVaccination" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="grid gap-4">
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
          <div className="grid gap-4 sm:grid-cols-2">
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
        </form>
      </Form>
    </KinderFormDialog>
  );
}

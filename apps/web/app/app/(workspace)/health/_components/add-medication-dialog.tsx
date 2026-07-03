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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { UpsertHealthMedicationSchema } from '~/lib/kinder/health/schemas/health.schema';
import { upsertHealthMedicationAction } from '~/lib/kinder/health/server-actions';
import type { StudentOption } from '~/lib/kinder/health/types';

export function AddMedicationDialog({
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

  const addMedication = useKinderMutation({
    mutationFn: upsertHealthMedicationAction,
    invalidateKeys: [kinderQueryKeys.health(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        studentId: studentId ?? students[0]?.id ?? '',
        name: '',
        dosage: '',
        frequency: '',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        instructions: '',
        isActive: true,
      });
      setOpen(false);
    },
  });

  if (students.length === 0) {
    return null;
  }

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:health.addMedication" />}
      footer={
        <KinderSubmitButton
          loading={addMedication.isPending}
          onClick={form.handleSubmit((data) => addMedication.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:health.addMedication" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:health.addMedication" />}
      trigger={
        <Button size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:health.addMedication" />
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
          <div className="grid gap-4 sm:grid-cols-2">
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
        </form>
      </Form>
    </KinderFormDialog>
  );
}

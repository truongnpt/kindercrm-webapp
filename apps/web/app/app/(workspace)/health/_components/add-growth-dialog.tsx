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
import { UpsertGrowthRecordSchema } from '~/lib/kinder/health/schemas/health.schema';
import { upsertGrowthRecordAction } from '~/lib/kinder/health/server-actions';
import type { StudentOption } from '~/lib/kinder/health/types';

export function AddGrowthDialog({
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

  const addGrowth = useKinderMutation({
    mutationFn: upsertGrowthRecordAction,
    invalidateKeys: [kinderQueryKeys.health(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        studentId: studentId ?? students[0]?.id ?? '',
        recordDate: new Date().toISOString().slice(0, 10),
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
      description={<Trans i18nKey="kinder:health.addGrowth" />}
      footer={
        <KinderSubmitButton
          loading={addGrowth.isPending}
          onClick={form.handleSubmit((data) => addGrowth.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:health.addGrowth" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:health.addGrowth" />}
      trigger={
        <Button size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:health.addGrowth" />
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
          <div className="grid gap-4 sm:grid-cols-2">
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
        </form>
      </Form>
    </KinderFormDialog>
  );
}

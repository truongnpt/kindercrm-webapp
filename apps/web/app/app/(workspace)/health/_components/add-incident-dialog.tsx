'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { CreateHealthIncidentSchema } from '~/lib/kinder/health/schemas/health.schema';
import { createHealthIncidentAction } from '~/lib/kinder/health/server-actions';
import type { StudentOption } from '~/lib/kinder/health/types';

export function AddIncidentDialog({
  schoolId,
  studentId,
  students,
}: {
  schoolId: string;
  studentId?: string;
  students: StudentOption[];
}) {
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateHealthIncidentSchema),
    defaultValues: {
      schoolId,
      studentId: studentId ?? students[0]?.id ?? '',
      incidentDate: new Date().toISOString().slice(0, 10),
      incidentTime: '',
      incidentType: 'other' as const,
      severity: 'minor' as const,
      description: '',
      treatment: '',
      notifyParent: true,
    },
  });

  const addIncident = useKinderMutation({
    mutationFn: createHealthIncidentAction,
    invalidateKeys: [kinderQueryKeys.health(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        studentId: studentId ?? students[0]?.id ?? '',
        incidentDate: new Date().toISOString().slice(0, 10),
        incidentTime: '',
        incidentType: 'other',
        severity: 'minor',
        description: '',
        treatment: '',
        notifyParent: true,
      });
      setOpen(false);
    },
  });

  if (students.length === 0) {
    return null;
  }

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:health.addIncident" />}
      footer={
        <KinderSubmitButton
          loading={addIncident.isPending}
          onClick={form.handleSubmit((data) => addIncident.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:health.addIncident" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:health.addIncident" />}
      trigger={
        <Button size="sm" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:health.addIncident" />
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:health.incidentDescription" />
                </FormLabel>
                <FormControl>
                  <Textarea {...field} required rows={3} />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="incidentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:health.incidentType" />
                  </FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                      {...field}
                    >
                      {['injury', 'illness', 'allergy_reaction', 'fall', 'other'].map(
                        (type) => (
                          <option key={type} value={type}>
                            {t(`health.incidentTypes.${type}`)}
                          </option>
                        ),
                      )}
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:health.severityLabel" />
                  </FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm"
                      {...field}
                    >
                      {['minor', 'moderate', 'serious'].map((level) => (
                        <option key={level} value={level}>
                          {t(`health.severity.${level}`)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </KinderFormDialog>
  );
}

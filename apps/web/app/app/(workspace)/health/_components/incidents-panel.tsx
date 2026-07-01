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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { CreateHealthIncidentSchema } from '~/lib/kinder/health/schemas/health.schema';
import { PanelEmpty } from '~/components/kinder-ui';
import { createHealthIncidentAction, notifyParentIncidentAction } from '~/lib/kinder/health/server-actions';
import type { HealthIncident, StudentOption } from '~/lib/kinder/health/types';

import { HealthStudentFilter } from './health-student-filter';

export function IncidentsPanel({
  schoolId,
  students,
  incidents,
  studentId,
}: {
  schoolId: string;
  students: StudentOption[];
  incidents: HealthIncident[];
  studentId?: string;
}) {
  const { t } = useTranslation('kinder');
  const studentMap = new Map(students.map((s) => [s.id, s]));

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

  return (
    <div className="space-y-6">
      <HealthStudentFilter studentId={studentId} students={students} tab="incidents" />

      {incidents.length === 0 ? (
        <PanelEmpty messageKey="kinder:health.emptyIncidents" />
      ) : (
        <ul className="kinder-list-panel">
          {incidents.map((incident) => (
            <li className="flex items-start justify-between gap-3 p-4 text-sm" key={incident.id}>
              <div>
                <p className="font-medium">
                  {studentMap.get(incident.student_id)?.full_name ?? '—'} ·{' '}
                  {incident.incident_date}
                </p>
                <p className="text-muted-foreground text-xs">
                  <Trans
                    i18nKey={`kinder:health.incidentTypes.${incident.incident_type}`}
                  />{' '}
                  ·{' '}
                  <Trans
                    i18nKey={`kinder:health.severity.${incident.severity}`}
                  />
                </p>
                <p className="mt-1">{incident.description}</p>
              </div>
              {!incident.parent_notified_at ? (
                <Button
                  onClick={async () => {
                    const promise = notifyParentIncidentAction({
                      schoolId,
                      incidentId: incident.id,
                    });
                    toast.promise(promise, {
                      loading: t('schoolSettings.saving'),
                      success: t('health.parentNotified'),
                      error: t('common:genericServerError', { ns: 'common' }),
                    });
                    await promise;
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Trans i18nKey="kinder:health.notifyParent" />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form
          className="kinder-form-panel max-w-xl grid-cols-1"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createHealthIncidentAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('health.incidentSaved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({
              schoolId,
              studentId: data.studentId,
              incidentDate: new Date().toISOString().slice(0, 10),
              incidentTime: '',
              incidentType: 'other',
              severity: 'minor',
              description: '',
              treatment: '',
              notifyParent: true,
            });
          })}
        >
          <p className="font-medium">
            <Trans i18nKey="kinder:health.addIncident" />
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
          <div className="grid gap-3 sm:grid-cols-2">
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
          <Button disabled={students.length === 0} type="submit">
            <Trans i18nKey="kinder:health.addIncident" />
          </Button>
        </form>
      </Form>
    </div>
  );
}

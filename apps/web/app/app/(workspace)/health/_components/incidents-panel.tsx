'use client';

import { AlertTriangle } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  DataTableCard,
  EmptyState,
  StatusBadge,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { notifyParentIncidentAction } from '~/lib/kinder/health/server-actions';
import type { HealthIncident, StudentOption } from '~/lib/kinder/health/types';

import { AddIncidentDialog } from './add-incident-dialog';
import { HealthStudentFilter } from './health-student-filter';

const SEVERITY_TONE: Record<string, 'success' | 'warning' | 'danger'> = {
  minor: 'success',
  moderate: 'warning',
  serious: 'danger',
};

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
  const studentMap = new Map(students.map((s) => [s.id, s]));

  const notifyMutation = useKinderMutation({
    mutationFn: notifyParentIncidentAction,
    invalidateKeys: [kinderQueryKeys.health(schoolId)],
  });

  return (
    <div className="space-y-6">
      <HealthStudentFilter
        studentId={studentId}
        students={students}
        tab="incidents"
      />

      <div className="flex justify-end">
        <AddIncidentDialog
          schoolId={schoolId}
          studentId={studentId}
          students={students}
        />
      </div>

      {incidents.length === 0 ? (
        <EmptyState
          compact
          descriptionKey="kinder:ui.emptyDefaultDescription"
          icon={AlertTriangle}
          titleKey="kinder:health.emptyIncidents"
        />
      ) : (
        <>
          <div className="hidden md:block">
            <DataTableCard
              description={<Trans i18nKey="kinder:health.tabs.incidents" />}
              title={<Trans i18nKey="kinder:health.tabs.incidents" />}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>
                      <Trans i18nKey="kinder:students.student" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:attendance.date" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.incidentType" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.severityLabel" />
                    </th>
                    <th className="text-right" />
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => (
                    <tr key={incident.id}>
                      <td>
                        <p className="font-medium">
                          {studentMap.get(incident.student_id)?.full_name ?? '—'}
                        </p>
                        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                          {incident.description}
                        </p>
                      </td>
                      <td>{incident.incident_date}</td>
                      <td>
                        <Trans
                          i18nKey={`kinder:health.incidentTypes.${incident.incident_type}`}
                        />
                      </td>
                      <td>
                        <StatusBadge
                          tone={SEVERITY_TONE[incident.severity] ?? 'muted'}
                        >
                          <Trans
                            i18nKey={`kinder:health.severity.${incident.severity}`}
                          />
                        </StatusBadge>
                      </td>
                      <td className="text-right">
                        {!incident.parent_notified_at ? (
                          <Button
                            className="rounded-lg"
                            disabled={notifyMutation.isPending}
                            onClick={() =>
                              notifyMutation.mutate({
                                schoolId,
                                incidentId: incident.id,
                              })
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Trans i18nKey="kinder:health.notifyParent" />
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableCard>
          </div>

          <div className="space-y-3 md:hidden">
            {incidents.map((incident) => (
              <article className="kinder-mobile-card" key={incident.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {studentMap.get(incident.student_id)?.full_name ?? '—'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {incident.incident_date}
                    </p>
                  </div>
                  <StatusBadge
                    tone={SEVERITY_TONE[incident.severity] ?? 'muted'}
                  >
                    <Trans
                      i18nKey={`kinder:health.severity.${incident.severity}`}
                    />
                  </StatusBadge>
                </div>
                <p className="mt-2 text-sm">{incident.description}</p>
                {!incident.parent_notified_at ? (
                  <Button
                    className="mt-3 w-full"
                    disabled={notifyMutation.isPending}
                    onClick={() =>
                      notifyMutation.mutate({
                        schoolId,
                        incidentId: incident.id,
                      })
                    }
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Trans i18nKey="kinder:health.notifyParent" />
                  </Button>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

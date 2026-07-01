'use client';

import { Syringe } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { DataTableCard, EmptyState } from '~/components/kinder-ui';
import type { HealthVaccination, StudentOption } from '~/lib/kinder/health/types';

import { AddVaccinationDialog } from './add-vaccination-dialog';
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
  const studentMap = new Map(students.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <HealthStudentFilter
        studentId={studentId}
        students={students}
        tab="vaccinations"
      />

      <div className="flex justify-end">
        <AddVaccinationDialog
          schoolId={schoolId}
          studentId={studentId}
          students={students}
        />
      </div>

      {vaccinations.length === 0 ? (
        <EmptyState
          compact
          descriptionKey="kinder:ui.emptyDefaultDescription"
          icon={Syringe}
          titleKey="kinder:health.emptyVaccinations"
        />
      ) : (
        <>
          <div className="hidden md:block">
            <DataTableCard
              description={<Trans i18nKey="kinder:health.tabs.vaccinations" />}
              title={<Trans i18nKey="kinder:health.tabs.vaccinations" />}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>
                      <Trans i18nKey="kinder:students.student" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.vaccineName" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.doseNumber" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.administeredOn" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.nextDueOn" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map((row) => (
                    <tr key={row.id}>
                      <td className="font-medium">
                        {studentMap.get(row.student_id)?.full_name ?? '—'}
                      </td>
                      <td>{row.vaccine_name}</td>
                      <td>{row.dose_number}</td>
                      <td>{row.administered_on}</td>
                      <td>{row.next_due_on ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableCard>
          </div>

          <div className="space-y-3 md:hidden">
            {vaccinations.map((row) => (
              <article className="kinder-mobile-card" key={row.id}>
                <p className="font-medium">
                  {studentMap.get(row.student_id)?.full_name ?? '—'}
                </p>
                <p className="mt-1 font-medium">{row.vaccine_name}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  <Trans i18nKey="kinder:health.doseNumber" />: {row.dose_number}{' '}
                  · {row.administered_on}
                  {row.next_due_on ?
                    ` · ${row.next_due_on}`
                  : ''}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

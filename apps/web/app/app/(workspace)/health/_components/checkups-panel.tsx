'use client';

import { Stethoscope } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { DataTableCard, EmptyState } from '~/components/kinder-ui';
import type { HealthMedicalCheckup, StudentOption } from '~/lib/kinder/health/types';

import { AddCheckupDialog } from './add-checkup-dialog';
import { HealthStudentFilter } from './health-student-filter';

export function CheckupsPanel({
  schoolId,
  students,
  checkups,
  studentId,
}: {
  schoolId: string;
  students: StudentOption[];
  checkups: HealthMedicalCheckup[];
  studentId?: string;
}) {
  const studentMap = new Map(students.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <HealthStudentFilter
        studentId={studentId}
        students={students}
        tab="checkups"
      />

      <div className="flex justify-end">
        <AddCheckupDialog
          schoolId={schoolId}
          studentId={studentId}
          students={students}
        />
      </div>

      {checkups.length === 0 ? (
        <EmptyState
          compact
          descriptionKey="kinder:ui.emptyDefaultDescription"
          icon={Stethoscope}
          titleKey="kinder:health.emptyCheckups"
        />
      ) : (
        <>
          <div className="hidden md:block">
            <DataTableCard
              description={<Trans i18nKey="kinder:health.tabs.checkups" />}
              title={<Trans i18nKey="kinder:health.tabs.checkups" />}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>
                      <Trans i18nKey="kinder:students.student" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.checkupDate" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.doctorName" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {checkups.map((row) => (
                    <tr key={row.id}>
                      <td className="font-medium">
                        {studentMap.get(row.student_id)?.full_name ?? '—'}
                      </td>
                      <td>{row.checkup_date}</td>
                      <td>{row.doctor_name ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableCard>
          </div>

          <div className="space-y-3 md:hidden">
            {checkups.map((row) => (
              <article className="kinder-mobile-card" key={row.id}>
                <p className="font-medium">
                  {studentMap.get(row.student_id)?.full_name ?? '—'}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {row.checkup_date}
                  {row.doctor_name ? ` · ${row.doctor_name}` : ''}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

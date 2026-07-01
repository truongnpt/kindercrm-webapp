'use client';

import { TrendingUp } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { DataTableCard, EmptyState } from '~/components/kinder-ui';
import type { HealthGrowthRecord, StudentOption } from '~/lib/kinder/health/types';

import { AddGrowthDialog } from './add-growth-dialog';
import { HealthStudentFilter } from './health-student-filter';

export function GrowthPanel({
  schoolId,
  students,
  records,
  studentId,
}: {
  schoolId: string;
  students: StudentOption[];
  records: HealthGrowthRecord[];
  studentId?: string;
}) {
  const studentMap = new Map(students.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <HealthStudentFilter
        studentId={studentId}
        students={students}
        tab="growth"
      />

      <div className="flex justify-end">
        <AddGrowthDialog
          schoolId={schoolId}
          studentId={studentId}
          students={students}
        />
      </div>

      {records.length === 0 ? (
        <EmptyState
          compact
          descriptionKey="kinder:ui.emptyDefaultDescription"
          icon={TrendingUp}
          titleKey="kinder:health.emptyGrowth"
        />
      ) : (
        <>
          <div className="hidden md:block">
            <DataTableCard
              description={<Trans i18nKey="kinder:health.tabs.growth" />}
              title={<Trans i18nKey="kinder:health.tabs.growth" />}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>
                      <Trans i18nKey="kinder:students.student" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.recordDate" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.height" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.weight" />
                    </th>
                    <th>BMI</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="font-medium">
                        {studentMap.get(record.student_id)?.full_name ?? '—'}
                      </td>
                      <td>{record.record_date}</td>
                      <td>
                        {record.height_cm ? `${record.height_cm} cm` : '—'}
                      </td>
                      <td>
                        {record.weight_kg ? `${record.weight_kg} kg` : '—'}
                      </td>
                      <td>{record.bmi ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableCard>
          </div>

          <div className="space-y-3 md:hidden">
            {records.map((record) => (
              <article className="kinder-mobile-card" key={record.id}>
                <p className="font-medium">
                  {studentMap.get(record.student_id)?.full_name ?? '—'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {record.record_date}
                </p>
                <div className="text-muted-foreground mt-3 grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <Trans i18nKey="kinder:health.height" />:{' '}
                    {record.height_cm ? `${record.height_cm} cm` : '—'}
                  </p>
                  <p>
                    <Trans i18nKey="kinder:health.weight" />:{' '}
                    {record.weight_kg ? `${record.weight_kg} kg` : '—'}
                  </p>
                  <p className="col-span-2">BMI: {record.bmi ?? '—'}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

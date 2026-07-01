'use client';

import { Pill } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { DataTableCard, EmptyState } from '~/components/kinder-ui';
import type { HealthMedication, StudentOption } from '~/lib/kinder/health/types';

import { AddMedicationDialog } from './add-medication-dialog';
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
  const studentMap = new Map(students.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <HealthStudentFilter
        studentId={studentId}
        students={students}
        tab="medications"
      />

      <div className="flex justify-end">
        <AddMedicationDialog
          schoolId={schoolId}
          studentId={studentId}
          students={students}
        />
      </div>

      {medications.length === 0 ? (
        <EmptyState
          compact
          descriptionKey="kinder:ui.emptyDefaultDescription"
          icon={Pill}
          titleKey="kinder:health.emptyMedications"
        />
      ) : (
        <>
          <div className="hidden md:block">
            <DataTableCard
              description={<Trans i18nKey="kinder:health.tabs.medications" />}
              title={<Trans i18nKey="kinder:health.tabs.medications" />}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>
                      <Trans i18nKey="kinder:students.student" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.medicationName" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.dosage" />
                    </th>
                    <th>
                      <Trans i18nKey="kinder:health.frequency" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med) => (
                    <tr key={med.id}>
                      <td className="font-medium">
                        {studentMap.get(med.student_id)?.full_name ?? '—'}
                      </td>
                      <td>{med.name}</td>
                      <td>{med.dosage ?? '—'}</td>
                      <td>{med.frequency ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTableCard>
          </div>

          <div className="space-y-3 md:hidden">
            {medications.map((med) => (
              <article className="kinder-mobile-card" key={med.id}>
                <p className="font-medium">
                  {studentMap.get(med.student_id)?.full_name ?? '—'}
                </p>
                <p className="mt-1 font-medium">{med.name}</p>
                <p className="text-muted-foreground mt-2 text-xs">
                  {med.dosage} · {med.frequency} · {med.start_date}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

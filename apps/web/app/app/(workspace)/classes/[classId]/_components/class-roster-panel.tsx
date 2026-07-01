'use client';

import Link from 'next/link';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import { DataTableCard, PanelEmpty } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { EnrollStudentSchema } from '~/lib/kinder/classes/schemas/class.schema';
import { enrollStudentAction } from '~/lib/kinder/classes/server-actions';
import type { ClassEnrollment } from '~/lib/kinder/classes/types';

import { TransferStudentDialog } from './transfer-student-dialog';

export function ClassRosterPanel({
  classId,
  schoolId,
  enrollments,
  unassignedStudents,
  allClasses,
}: {
  classId: string;
  schoolId: string;
  enrollments: ClassEnrollment[];
  unassignedStudents: Array<{
    id: string;
    full_name: string;
    student_code: string;
  }>;
  allClasses: Array<{ id: string; name: string; code: string }>;
}) {
  const { t } = useTranslation('kinder');
  const form = useForm({
    resolver: zodResolver(EnrollStudentSchema),
    defaultValues: { classId, schoolId, studentId: '' },
  });

  return (
    <div className="space-y-6">
      <DataTableCard
        description={<Trans i18nKey="kinder:classes.rosterHint" />}
        title={<Trans i18nKey="kinder:classes.roster" />}
      >
        {enrollments.length === 0 ? (
          <PanelEmpty messageKey="kinder:classes.noStudents" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>
                  <Trans i18nKey="kinder:students.code" />
                </th>
                <th>
                  <Trans i18nKey="kinder:students.fullName" />
                </th>
                <th className="text-right">
                  <Trans i18nKey="kinder:ui.actions" />
                </th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((row) => (
                <tr key={row.id}>
                  <td className="font-mono text-xs">
                    {row.student?.student_code}
                  </td>
                  <td className="font-medium">{row.student?.full_name}</td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <TransferStudentDialog
                        allClasses={allClasses}
                        fromClassId={classId}
                        schoolId={schoolId}
                        studentId={row.student_id}
                        studentName={row.student?.full_name ?? ''}
                      />
                      <Button asChild className="rounded-lg" size="sm" variant="outline">
                        <Link
                          href={`${pathsConfig.app.studentDetail}/${row.student_id}`}
                        >
                          <Trans i18nKey="kinder:students.detail" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </DataTableCard>

      {unassignedStudents.length > 0 ? (
        <Form {...form}>
          <form
            className="kinder-form-panel flex flex-wrap items-end gap-3 rounded-xl border border-border bg-muted/20 p-4"
            onSubmit={form.handleSubmit(async (data) => {
              const promise = enrollStudentAction(data);
              toast.promise(promise, {
                loading: t('schoolSettings.saving'),
                success: t('schoolSettings.saved'),
                error: t('kinder:errors.classCapacity'),
              });
              await promise;
              form.reset({ classId, schoolId, studentId: '' });
            })}
          >
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem className="min-w-[220px] flex-1">
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.enrollStudent" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-lg">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unassignedStudents.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.full_name} ({s.student_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button className="rounded-lg" type="submit">
              <Trans i18nKey="kinder:classes.enrollStudent" />
            </Button>
          </form>
        </Form>
      ) : null}
    </div>
  );
}

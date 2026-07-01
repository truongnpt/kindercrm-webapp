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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import { AssignStaffClassSchema } from '~/lib/kinder/staff/schemas/staff.schema';
import {
  assignStaffClassAction,
  removeStaffClassAssignmentAction,
} from '~/lib/kinder/staff/server-actions';
import type { StaffHomeroomClass } from '~/lib/kinder/staff/types';

export function StaffClassesPanel({
  schoolId,
  employeeId,
  homeroomClasses,
  assignments,
  availableClasses,
  canManage,
}: {
  schoolId: string;
  employeeId: string;
  homeroomClasses: StaffHomeroomClass[];
  assignments: Array<{
    id: string;
    assignment_role: string;
    class: StaffHomeroomClass;
  }>;
  availableClasses: Array<{ id: string; name: string; code: string }>;
  canManage: boolean;
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(AssignStaffClassSchema),
    defaultValues: {
      schoolId,
      employeeId,
      classId: '',
      assignmentRole: 'assistant' as const,
    },
  });

  return (
    <section className="space-y-4">
      <h2 className="font-semibold">
        <Trans i18nKey="kinder:staff.classes.title" />
      </h2>

      {homeroomClasses.length > 0 ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:staff.classes.homeroom" />
          </p>
          {homeroomClasses.map((cls) => (
            <div className="rounded-lg border p-3 text-sm" key={cls.id}>
              {cls.name} <span className="font-mono text-xs">({cls.code})</span>
            </div>
          ))}
        </div>
      ) : null}

      {assignments.length > 0 ? (
        <div className="space-y-2">
          {assignments.map((assignment) => (
            <div
              className="flex items-center justify-between rounded-lg border p-3 text-sm"
              key={assignment.id}
            >
              <span>
                {assignment.class.name}{' '}
                <span className="text-muted-foreground">
                  (
                  <Trans
                    i18nKey={`kinder:staff.classes.roles.${assignment.assignment_role}`}
                  />
                  )
                </span>
              </span>
              {canManage ? (
                <Button
                  onClick={async () => {
                    const promise = removeStaffClassAssignmentAction({
                      schoolId,
                      assignmentId: assignment.id,
                    });
                    toast.promise(promise, {
                      loading: t('schoolSettings.saving'),
                      success: t('schoolSettings.saved'),
                      error: t('common:genericServerError', { ns: 'common' }),
                    });
                    await promise;
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trans i18nKey="kinder:staff.classes.remove" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:staff.classes.empty" />
        </p>
      )}

      {canManage ? (
        <Form {...form}>
          <form
            className="grid max-w-xl gap-4 rounded-lg border p-4 md:grid-cols-3"
            onSubmit={form.handleSubmit(async (data) => {
              const promise = assignStaffClassAction(data);
              toast.promise(promise, {
                loading: t('schoolSettings.saving'),
                success: t('schoolSettings.saved'),
                error: t('common:genericServerError', { ns: 'common' }),
              });
              await promise;
            })}
          >
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.classes.class" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignmentRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.classes.role" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="homeroom">
                        <Trans i18nKey="kinder:staff.classes.roles.homeroom" />
                      </SelectItem>
                      <SelectItem value="assistant">
                        <Trans i18nKey="kinder:staff.classes.roles.assistant" />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <Button className="md:col-span-3" type="submit">
              <Trans i18nKey="kinder:staff.classes.assign" />
            </Button>
          </form>
        </Form>
      ) : null}
    </section>
  );
}

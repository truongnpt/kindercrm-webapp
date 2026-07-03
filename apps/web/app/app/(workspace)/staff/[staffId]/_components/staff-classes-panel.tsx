'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

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

import {
  BentoTile,
  BentoTileHeader,
  EntityRowActions,
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  PanelEmpty,
  useKinderMutation,
} from '~/components/kinder-ui';
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
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(AssignStaffClassSchema),
    defaultValues: {
      schoolId,
      employeeId,
      classId: '',
      assignmentRole: 'assistant' as const,
    },
  });

  const assignClass = useKinderMutation({
    mutationFn: assignStaffClassAction,
    invalidateKeys: [kinderQueryKeys.staff.detail(schoolId, employeeId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        employeeId,
        classId: '',
        assignmentRole: 'assistant',
      });
      setOpen(false);
    },
  });

  const removeAssignment = useKinderMutation({
    mutationFn: removeStaffClassAssignmentAction,
    invalidateKeys: [kinderQueryKeys.staff.detail(schoolId, employeeId)],
  });

  const hasContent = homeroomClasses.length > 0 || assignments.length > 0;

  return (
    <BentoTile>
      <div className="flex items-start justify-between gap-3">
        <BentoTileHeader
          description={<Trans i18nKey="kinder:staff.classes.hint" />}
          title={<Trans i18nKey="kinder:staff.classes.title" />}
        />
        {canManage ? (
          <Button className="shrink-0"
 onClick={() => setOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="mr-1.5 size-4" />
            <Trans i18nKey="kinder:staff.classes.assign" />
          </Button>
        ) : null}
      </div>

      {hasContent ? (
        <div className="mt-4 space-y-4">
          {homeroomClasses.length > 0 ? (
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                <Trans i18nKey="kinder:staff.classes.homeroom" />
              </p>
              {homeroomClasses.map((cls) => (
                <div
                  className="flex items-center gap-3 rounded-2xl bg-muted/25 px-4 py-3 text-sm"
                  key={cls.id}
                >
                  <GraduationCap className="text-primary size-4 shrink-0" />
                  <span>
                    {cls.name}{' '}
                    <span className="text-muted-foreground font-mono text-xs">
                      ({cls.code})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {assignments.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {assignments.map((assignment) => (
                <li
                  className="flex items-center justify-between gap-3 rounded-2xl bg-muted/25 px-4 py-3 text-sm"
                  key={assignment.id}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <GraduationCap className="text-primary size-4 shrink-0" />
                    <span className="min-w-0">
                      {assignment.class.name}{' '}
                      <span className="text-muted-foreground">
                        (
                        <Trans
                          i18nKey={`kinder:staff.classes.roles.${assignment.assignment_role}`}
                        />
                        )
                      </span>
                    </span>
                  </div>
                  {canManage ? (
                    <EntityRowActions
                      onDelete={() =>
                        removeAssignment.mutate({
                          schoolId,
                          assignmentId: assignment.id,
                        })
                      }
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <div className="mt-4">
          <PanelEmpty messageKey="kinder:staff.classes.empty" />
        </div>
      )}

      {canManage ? (
        <KinderFormDialog
          onOpenChange={setOpen}
          open={open}
          size="sm"
          title={<Trans i18nKey="kinder:staff.classes.assign" />}
          footer={
            <KinderSubmitButton
              loading={assignClass.isPending}
              onClick={form.handleSubmit((data) => assignClass.mutate(data))}
              type="button"
            >
              <Trans i18nKey="kinder:staff.classes.assign" />
            </KinderSubmitButton>
          }
        >
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
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
            </form>
          </Form>
        </KinderFormDialog>
      ) : null}
    </BentoTile>
  );
}

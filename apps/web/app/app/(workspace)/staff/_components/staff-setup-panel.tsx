'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Plus, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import {
  BentoGrid,
  BentoTile,
  BentoTileHeader,
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  PanelEmpty,
  useKinderMutation,
} from '~/components/kinder-ui';
import {
  CreateDepartmentSchema,
  CreatePositionSchema,
} from '~/lib/kinder/staff/schemas/staff.schema';
import {
  createDepartmentAction,
  createPositionAction,
} from '~/lib/kinder/staff/server-actions';
import type { StaffDepartment } from '~/lib/kinder/staff/types';

export function StaffSetupPanel({
  schoolId,
  departments,
  positions,
}: {
  schoolId: string;
  departments: StaffDepartment[];
  positions: Array<{ id: string; name: string; department_id: string | null }>;
}) {
  const [deptOpen, setDeptOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);

  const deptForm = useForm({
    resolver: zodResolver(CreateDepartmentSchema),
    defaultValues: { schoolId, name: '', description: '' },
  });

  const posForm = useForm({
    resolver: zodResolver(CreatePositionSchema),
    defaultValues: { schoolId, name: '', departmentId: '', description: '' },
  });

  const createDepartment = useKinderMutation({
    mutationFn: createDepartmentAction,
    invalidateKeys: [kinderQueryKeys.staff.all(schoolId)],
    onSuccess: () => {
      deptForm.reset({ schoolId, name: '', description: '' });
      setDeptOpen(false);
    },
  });

  const createPosition = useKinderMutation({
    mutationFn: createPositionAction,
    invalidateKeys: [kinderQueryKeys.staff.all(schoolId)],
    onSuccess: () => {
      posForm.reset({ schoolId, name: '', departmentId: '', description: '' });
      setPosOpen(false);
    },
  });

  return (
    <BentoGrid columns={2}>
      <BentoTile>
        <div className="flex items-start justify-between gap-3">
          <BentoTileHeader
            description={<Trans i18nKey="kinder:staff.departmentsHint" />}
            title={<Trans i18nKey="kinder:staff.departments" />}
          />
          <Button
            className="shrink-0 rounded-full"
            onClick={() => setDeptOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="mr-1.5 size-4" />
            <Trans i18nKey="kinder:staff.addDepartment" />
          </Button>
        </div>

        {departments.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {departments.map((department) => (
              <li
                className="flex items-center gap-3 rounded-2xl bg-muted/25 px-4 py-3 text-sm"
                key={department.id}
              >
                <Building2 className="text-primary size-4 shrink-0" />
                <span className="font-medium">{department.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <PanelEmpty messageKey="kinder:staff.departmentsEmpty" />
          </div>
        )}
      </BentoTile>

      <BentoTile>
        <div className="flex items-start justify-between gap-3">
          <BentoTileHeader
            description={<Trans i18nKey="kinder:staff.positionsHint" />}
            title={<Trans i18nKey="kinder:staff.positions" />}
          />
          <Button
            className="shrink-0 rounded-full"
            onClick={() => setPosOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="mr-1.5 size-4" />
            <Trans i18nKey="kinder:staff.addPosition" />
          </Button>
        </div>

        {positions.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {positions.map((position) => (
              <li
                className="flex items-center gap-3 rounded-2xl bg-muted/25 px-4 py-3 text-sm"
                key={position.id}
              >
                <Briefcase className="text-primary size-4 shrink-0" />
                <span className="font-medium">{position.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <PanelEmpty messageKey="kinder:staff.positionsEmpty" />
          </div>
        )}
      </BentoTile>

      <KinderFormDialog
        onOpenChange={setDeptOpen}
        open={deptOpen}
        size="sm"
        title={<Trans i18nKey="kinder:staff.addDepartment" />}
        footer={
          <KinderSubmitButton
            loading={createDepartment.isPending}
            onClick={deptForm.handleSubmit((data) =>
              createDepartment.mutate(data),
            )}
            type="button"
          >
            <Trans i18nKey="kinder:staff.addDepartment" />
          </KinderSubmitButton>
        }
      >
        <Form {...deptForm}>
          <form className="space-y-4">
            <FormField
              control={deptForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.department" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </KinderFormDialog>

      <KinderFormDialog
        onOpenChange={setPosOpen}
        open={posOpen}
        size="sm"
        title={<Trans i18nKey="kinder:staff.addPosition" />}
        footer={
          <KinderSubmitButton
            loading={createPosition.isPending}
            onClick={posForm.handleSubmit((data) => createPosition.mutate(data))}
            type="button"
          >
            <Trans i18nKey="kinder:staff.addPosition" />
          </KinderSubmitButton>
        }
      >
        <Form {...posForm}>
          <form className="space-y-4">
            <FormField
              control={posForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.position" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </KinderFormDialog>
    </BentoGrid>
  );
}

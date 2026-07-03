'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import type { SchoolCustomRole } from '~/lib/kinder/permissions';
import type { Campus } from '~/lib/kinder/types';
import { CreateStaffEmployeeSchema } from '~/lib/kinder/staff/schemas/staff.schema';
import { createStaffEmployeeAction } from '~/lib/kinder/staff/server-actions';
import type { StaffDepartment, StaffPosition } from '~/lib/kinder/staff/types';

import { StaffFormFields } from './staff-form-fields';

export function CreateStaffDialog({
  schoolId,
  departments,
  positions,
  campuses,
  canManageAccess,
  customRoles = [],
}: {
  schoolId: string;
  departments: StaffDepartment[];
  positions: StaffPosition[];
  campuses: Campus[];
  canManageAccess: boolean;
  customRoles?: SchoolCustomRole[];
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateStaffEmployeeSchema),
    defaultValues: {
      schoolId,
      fullName: '',
      employeeCode: '',
      email: '',
      phone: '',
      isTeacher: false,
      accessRoleKey: 'staff',
      grantSystemAccess: false,
      departmentId: '',
      positionId: '',
      campusId: '',
      hireDate: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const createStaff = useKinderMutation({
    mutationFn: createStaffEmployeeAction,
    invalidateKeys: [kinderQueryKeys.staff.all(schoolId)],
    refresh: false,
    onSuccess: () => {
      form.reset({
        schoolId,
        fullName: '',
        employeeCode: '',
        email: '',
        phone: '',
        isTeacher: false,
        accessRoleKey: 'staff',
        grantSystemAccess: false,
        departmentId: '',
        positionId: '',
        campusId: '',
        hireDate: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setOpen(false);
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:staff.createDescription" />}
      footer={
        <KinderSubmitButton
          loading={createStaff.isPending}
          onClick={form.handleSubmit((data) => createStaff.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:staff.create" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:staff.create" />}
      trigger={
        <Button type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:staff.create" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <StaffFormFields
            campuses={campuses}
            canManageAccess={canManageAccess}
            customRoles={customRoles}
            departments={departments}
            form={form}
            mode="create"
            positions={positions}
          />
        </form>
      </Form>
    </KinderFormDialog>
  );
}

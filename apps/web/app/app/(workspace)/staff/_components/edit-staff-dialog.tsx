'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
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
import type { Campus } from '~/lib/kinder/types';
import { toAccessRoleKey, type SchoolCustomRole } from '~/lib/kinder/permissions/client';
import type { z } from 'zod';

import { UpdateStaffEmployeeSchema } from '~/lib/kinder/staff/schemas/staff.schema';
import { updateStaffEmployeeAction } from '~/lib/kinder/staff/server-actions';
import type {
  StaffDepartment,
  StaffEmployeeDetail,
  StaffEmployeeListItem,
  StaffPosition,
} from '~/lib/kinder/staff/types';

import { StaffFormFields } from './staff-form-fields';

type EditableStaff = StaffEmployeeListItem | StaffEmployeeDetail;

type UpdateStaffForm = z.infer<typeof UpdateStaffEmployeeSchema>;

function toFormValues(employee: EditableStaff, schoolId: string): UpdateStaffForm {
  return {
    employeeId: employee.id,
    schoolId,
    fullName: employee.full_name,
    email: employee.email ?? '',
    phone: employee.phone ?? '',
    isTeacher: employee.is_teacher,
    accessRoleKey: toAccessRoleKey({
      accessRole: employee.access_role,
      customRoleId: employee.custom_role_id,
    }),
    grantSystemAccess: employee.grant_system_access,
    departmentId: employee.department_id ?? '',
    positionId: employee.position_id ?? '',
    campusId: employee.campus_id ?? '',
    managerId: employee.manager_id ?? '',
    employmentStatus: employee.employment_status,
    hireDate: employee.hire_date ?? '',
    terminationDate: employee.termination_date ?? '',
    dateOfBirth: employee.date_of_birth ?? '',
    gender: (employee.gender as UpdateStaffForm['gender']) ?? undefined,
    idNumber: employee.id_number ?? '',
    address: employee.address ?? '',
    emergencyContactName: employee.emergency_contact_name ?? '',
    emergencyContactPhone: employee.emergency_contact_phone ?? '',
    notes: employee.notes ?? '',
  };
}

export function EditStaffDialog({
  employee,
  schoolId,
  departments,
  positions,
  campuses,
  managers = [],
  canManageAccess,
  customRoles = [],
  open: controlledOpen,
  onOpenChange,
  trigger,
  hideTrigger,
}: {
  employee: EditableStaff;
  schoolId: string;
  departments: StaffDepartment[];
  positions: StaffPosition[];
  campuses: Campus[];
  managers?: Array<Pick<StaffEmployeeListItem, 'id' | 'full_name' | 'employee_code'>>;
  canManageAccess: boolean;
  customRoles?: SchoolCustomRole[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  hideTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm<UpdateStaffForm>({
    resolver: zodResolver(UpdateStaffEmployeeSchema),
    defaultValues: toFormValues(employee, schoolId),
  });

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(employee, schoolId));
    }
  }, [open, employee, schoolId, form]);

  const updateStaff = useKinderMutation({
    mutationFn: updateStaffEmployeeAction,
    invalidateKeys: [
      kinderQueryKeys.staff.all(schoolId),
      kinderQueryKeys.staff.detail(schoolId, employee.id),
    ],
    onSuccess: () => setOpen(false),
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:staff.editDescription" />}
      footer={
        <KinderSubmitButton
          loading={updateStaff.isPending}
          onClick={form.handleSubmit((data) => updateStaff.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:staff.save" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:ui.edit" />}
      trigger={
        hideTrigger ? undefined : (
          trigger ?? (
            <Button size="sm" type="button" variant="outline">
              <Pencil className="mr-2 size-4" />
              <Trans i18nKey="kinder:ui.edit" />
            </Button>
          )
        )
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
            managers={managers.filter((manager) => manager.id !== employee.id)}
            mode="edit"
            positions={positions}
          />
        </form>
      </Form>
    </KinderFormDialog>
  );
}

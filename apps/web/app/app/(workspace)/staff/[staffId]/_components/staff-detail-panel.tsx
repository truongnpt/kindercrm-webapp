'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import type { Campus } from '~/lib/kinder/types';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import { UpdateStaffEmployeeSchema } from '~/lib/kinder/staff/schemas/staff.schema';
import {
  deleteStaffEmployeeAction,
  updateStaffEmployeeAction,
} from '~/lib/kinder/staff/server-actions';
import type {
  StaffContract,
  StaffDepartment,
  StaffEmployeeDetail,
  StaffHomeroomClass,
  StaffPosition,
} from '~/lib/kinder/staff/types';

import { StaffClassesPanel } from './staff-classes-panel';
import { StaffContractsPanel } from './staff-contracts-panel';

const EMPLOYMENT_STATUSES = [
  'active',
  'inactive',
  'on_leave',
  'terminated',
] as const;

export function StaffDetailPanel({
  employee,
  schoolId,
  departments,
  positions,
  campuses,
  contracts,
  homeroomClasses,
  classAssignments,
  availableClasses,
  canManage,
}: {
  employee: StaffEmployeeDetail;
  schoolId: string;
  departments: StaffDepartment[];
  positions: StaffPosition[];
  campuses: Campus[];
  contracts: StaffContract[];
  homeroomClasses: StaffHomeroomClass[];
  classAssignments: Array<{
    id: string;
    assignment_role: string;
    class: StaffHomeroomClass;
  }>;
  availableClasses: Array<{ id: string; name: string; code: string }>;
  canManage: boolean;
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(UpdateStaffEmployeeSchema),
    defaultValues: {
      employeeId: employee.id,
      schoolId,
      fullName: employee.full_name,
      email: employee.email ?? '',
      phone: employee.phone ?? '',
      isTeacher: employee.is_teacher,
      accessRole: employee.access_role,
      grantSystemAccess: employee.grant_system_access,
      departmentId: employee.department_id ?? '',
      positionId: employee.position_id ?? '',
      campusId: employee.campus_id ?? '',
      employmentStatus: employee.employment_status,
      hireDate: employee.hire_date ?? '',
      terminationDate: employee.termination_date ?? '',
      dateOfBirth: employee.date_of_birth ?? '',
      gender: (employee.gender as 'male' | 'female' | 'other') ?? undefined,
      idNumber: employee.id_number ?? '',
      address: employee.address ?? '',
      emergencyContactName: employee.emergency_contact_name ?? '',
      emergencyContactPhone: employee.emergency_contact_phone ?? '',
      notes: employee.notes ?? '',
    },
  });

  const activeContract = contracts.find((contract) => contract.is_active);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{employee.employee_code}</Badge>
        {employee.is_teacher ? (
          <Badge>
            <Trans i18nKey="kinder:staff.teacherBadge" />
          </Badge>
        ) : null}
        {employee.user_id ? (
          <Badge variant="outline">
            <Trans i18nKey="kinder:staff.accountLinked" />
          </Badge>
        ) : employee.grant_system_access ? (
          <Badge variant="outline">
            <Trans i18nKey="kinder:staff.accountPending" />
          </Badge>
        ) : null}
        {activeContract ? (
          <span className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:staff.activeContract" />:{' '}
            {formatVnd(activeContract.salary_amount)}
          </span>
        ) : null}
      </div>

      {canManage ? (
        <Form {...form}>
          <form
            className="grid max-w-3xl gap-4"
            onSubmit={form.handleSubmit(async (data) => {
              const promise = updateStaffEmployeeAction(data);
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
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.fullName" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.email" />
                    </FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.phone" />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.department" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="positionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.position" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="campusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.campus" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {campuses.map((campus) => (
                          <SelectItem key={campus.id} value={campus.id}>
                            {campus.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="accessRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.accessRole" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">
                          <Trans i18nKey="kinder:staff.accessRoles.staff" />
                        </SelectItem>
                        <SelectItem value="admin">
                          <Trans i18nKey="kinder:staff.accessRoles.admin" />
                        </SelectItem>
                        <SelectItem value="accountant">
                          <Trans i18nKey="kinder:staff.accessRoles.accountant" />
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employmentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.status" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYMENT_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            <Trans
                              i18nKey={`kinder:staff.statuses.${status}`}
                            />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isTeacher"
              render={({ field }) => (
                <FormItem className="kinder-mobile-card flex-row items-start gap-3 p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.isTeacher" />
                    </FormLabel>
                    <FormDescription>
                      <Trans i18nKey="kinder:staff.isTeacherHint" />
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grantSystemAccess"
              render={({ field }) => (
                <FormItem className="kinder-mobile-card flex-row items-start gap-3 p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.grantAccess" />
                    </FormLabel>
                    <FormDescription>
                      <Trans i18nKey="kinder:staff.grantAccessHint" />
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:staff.notes" />
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit">
              <Trans i18nKey="kinder:staff.save" />
            </Button>
          </form>
        </Form>
      ) : null}

      {canManage ? (
        <StaffContractsPanel
          contracts={contracts}
          employeeId={employee.id}
          schoolId={schoolId}
        />
      ) : null}

      {employee.is_teacher ? (
        <StaffClassesPanel
          assignments={classAssignments}
          availableClasses={availableClasses}
          canManage={canManage}
          employeeId={employee.id}
          homeroomClasses={homeroomClasses}
          schoolId={schoolId}
        />
      ) : null}

      {canManage ? (
        <Button
          onClick={async () => {
            if (!confirm(t('staff.deleteConfirm'))) {
              return;
            }

            await deleteStaffEmployeeAction({
              schoolId,
              employeeId: employee.id,
            });
          }}
          type="button"
          variant="destructive"
        >
          <Trans i18nKey="kinder:staff.delete" />
        </Button>
      ) : null}
    </div>
  );
}

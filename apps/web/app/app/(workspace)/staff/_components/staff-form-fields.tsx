'use client';

import type { UseFormReturn } from 'react-hook-form';

import { Checkbox } from '@kit/ui/checkbox';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import type { SchoolCustomRole } from '~/lib/kinder/permissions';
import type { StaffDepartment, StaffPosition } from '~/lib/kinder/staff/types';

const EMPLOYMENT_STATUSES = [
  'active',
  'inactive',
  'on_leave',
  'terminated',
] as const;

export function StaffFormFields({
  form,
  departments,
  positions,
  campuses,
  customRoles = [],
  mode,
  canManageAccess = false,
}: {
  // Shared across create/edit schemas with different shapes.
  form: UseFormReturn<any>;
  departments: StaffDepartment[];
  positions: StaffPosition[];
  campuses: Campus[];
  customRoles?: SchoolCustomRole[];
  mode: 'create' | 'edit';
  canManageAccess?: boolean;
}) {
  return (
    <div className="space-y-4">
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
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey="kinder:staff.department" />
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
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
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
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
      </div>

      <FormField
        control={form.control}
        name="campusId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <Trans i18nKey="kinder:staff.campus" />
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ''}>
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

      {canManageAccess ? (
        <FormField
          control={form.control}
          name="accessRoleKey"
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
                  <SelectItem value="admin">
                    <Trans i18nKey="kinder:staff.accessRoles.admin" />
                  </SelectItem>
                  <SelectItem value="manager">
                    <Trans i18nKey="kinder:staff.accessRoles.manager" />
                  </SelectItem>
                  <SelectItem value="staff">
                    <Trans i18nKey="kinder:staff.accessRoles.staff" />
                  </SelectItem>
                  {customRoles.map((role) => (
                    <SelectItem key={role.id} value={`custom:${role.id}`}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                <Trans i18nKey="kinder:staff.accessRoleHint" />
              </FormDescription>
            </FormItem>
          )}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {mode === 'edit' ? (
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
                        <Trans i18nKey={`kinder:staff.statuses.${status}`} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="hireDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:staff.hireDate" />
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        )}
      </div>

      <FormField
        control={form.control}
        name="isTeacher"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start gap-3 rounded-2xl bg-muted/30 p-4">
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

      {canManageAccess ? (
        <FormField
          control={form.control}
          name="grantSystemAccess"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 rounded-2xl bg-muted/30 p-4">
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
      ) : null}

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
    </div>
  );
}

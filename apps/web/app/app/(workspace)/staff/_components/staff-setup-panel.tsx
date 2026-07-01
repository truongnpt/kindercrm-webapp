'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
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
  const { t } = useTranslation('kinder');
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

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            <Trans i18nKey="kinder:staff.departments" />
          </h2>
          <Dialog onOpenChange={setDeptOpen} open={deptOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Trans i18nKey="kinder:staff.addDepartment" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <Trans i18nKey="kinder:staff.addDepartment" />
                </DialogTitle>
              </DialogHeader>
              <Form {...deptForm}>
                <form
                  className="space-y-4"
                  onSubmit={deptForm.handleSubmit(async (data) => {
                    const promise = createDepartmentAction(data);
                    toast.promise(promise, {
                      loading: t('schoolSettings.saving'),
                      success: t('schoolSettings.saved'),
                      error: t('common:genericServerError', { ns: 'common' }),
                    });
                    await promise;
                    deptForm.reset({ schoolId, name: '', description: '' });
                    setDeptOpen(false);
                  })}
                >
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
                  <Button type="submit">
                    <Trans i18nKey="kinder:staff.addDepartment" />
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="kinder-list-panel">
          {departments.map((department) => (
            <li className="px-4 py-3 text-sm" key={department.id}>
              {department.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">
            <Trans i18nKey="kinder:staff.positions" />
          </h2>
          <Dialog onOpenChange={setPosOpen} open={posOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Trans i18nKey="kinder:staff.addPosition" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <Trans i18nKey="kinder:staff.addPosition" />
                </DialogTitle>
              </DialogHeader>
              <Form {...posForm}>
                <form
                  className="space-y-4"
                  onSubmit={posForm.handleSubmit(async (data) => {
                    const promise = createPositionAction(data);
                    toast.promise(promise, {
                      loading: t('schoolSettings.saving'),
                      success: t('schoolSettings.saved'),
                      error: t('common:genericServerError', { ns: 'common' }),
                    });
                    await promise;
                    posForm.reset({
                      schoolId,
                      name: '',
                      departmentId: '',
                      description: '',
                    });
                    setPosOpen(false);
                  })}
                >
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
                  <Button type="submit">
                    <Trans i18nKey="kinder:staff.addPosition" />
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        <ul className="kinder-list-panel">
          {positions.map((position) => (
            <li className="px-4 py-3 text-sm" key={position.id}>
              {position.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

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
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import {
  CreateClassroomSchema,
  CreateSchoolYearSchema,
} from '~/lib/kinder/classes/schemas/class.schema';
import {
  createClassroomAction,
  createSchoolYearAction,
} from '~/lib/kinder/classes/server-actions';
import type { Classroom, SchoolYear } from '~/lib/kinder/classes/types';

export function ClassesSetupPanel({
  schoolId,
  schoolYears,
  classrooms,
}: {
  schoolId: string;
  schoolYears: SchoolYear[];
  classrooms: Classroom[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <SchoolYearForm schoolId={schoolId} schoolYears={schoolYears} />
      <ClassroomForm classrooms={classrooms} schoolId={schoolId} />
    </div>
  );
}

function SchoolYearForm({
  schoolId,
  schoolYears,
}: {
  schoolId: string;
  schoolYears: SchoolYear[];
}) {
  const { t } = useTranslation('kinder');
  const year = new Date().getFullYear();

  const form = useForm({
    resolver: zodResolver(CreateSchoolYearSchema),
    defaultValues: {
      schoolId,
      name: `Năm học ${year}-${year + 1}`,
      startDate: `${year}-09-01`,
      endDate: `${year + 1}-05-31`,
      isCurrent: true,
    },
  });

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        <Trans i18nKey="kinder:classes.schoolYears" />
      </h3>
      <ul className="divide-y rounded-lg border text-sm">
        {schoolYears.map((y) => (
          <li className="p-3" key={y.id}>
            <p className="font-medium">{y.name}</p>
            <p className="text-muted-foreground">
              {y.start_date} → {y.end_date}
            </p>
          </li>
        ))}
      </ul>
      <Form {...form}>
        <form
          className="grid gap-3 rounded-lg border p-4"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createSchoolYearAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset();
          })}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.schoolYear" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.startDate" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.endDate" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">
            <Trans i18nKey="kinder:classes.addSchoolYear" />
          </Button>
        </form>
      </Form>
    </section>
  );
}

function ClassroomForm({
  schoolId,
  classrooms,
}: {
  schoolId: string;
  classrooms: Classroom[];
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(CreateClassroomSchema),
    defaultValues: {
      schoolId,
      name: '',
      capacity: 30,
      campusId: '',
    },
  });

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        <Trans i18nKey="kinder:classes.classrooms" />
      </h3>
      <ul className="divide-y rounded-lg border text-sm">
        {classrooms.map((room) => (
          <li className="flex justify-between p-3" key={room.id}>
            <span className="font-medium">{room.name}</span>
            <span className="text-muted-foreground">{room.capacity}</span>
          </li>
        ))}
      </ul>
      <Form {...form}>
        <form
          className="grid gap-3 rounded-lg border p-4"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = createClassroomAction(data);
            toast.promise(promise, {
              loading: t('schoolSettings.saving'),
              success: t('schoolSettings.saved'),
              error: t('common:genericServerError', { ns: 'common' }),
            });
            await promise;
            form.reset({ schoolId, name: '', capacity: 30, campusId: '' });
          })}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.classroom" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.roomCapacity" />
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">
            <Trans i18nKey="kinder:classes.addClassroom" />
          </Button>
        </form>
      </Form>
    </section>
  );
}

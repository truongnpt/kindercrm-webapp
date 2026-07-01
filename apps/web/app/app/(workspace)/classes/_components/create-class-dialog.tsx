'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
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
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import { CreateClassSchema } from '~/lib/kinder/classes/schemas/class.schema';
import { createClassAction } from '~/lib/kinder/classes/server-actions';
import type { Classroom, SchoolYear, Semester } from '~/lib/kinder/classes/types';

export function CreateClassDialog({
  schoolId,
  schoolYears,
  semesters,
  classrooms,
  teachers,
  defaultSchoolYearId,
}: {
  schoolId: string;
  schoolYears: SchoolYear[];
  semesters: Semester[];
  classrooms: Classroom[];
  teachers: Array<{ id: string; name: string; email: string | null }>;
  defaultSchoolYearId: string;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateClassSchema),
    defaultValues: {
      schoolId,
      schoolYearId: defaultSchoolYearId,
      semesterId: '',
      classroomId: '',
      campusId: '',
      name: '',
      code: '',
      capacity: 25,
      teacherUserId: '',
    },
  });

  const schoolYearId = form.watch('schoolYearId');
  const filteredSemesters = semesters.filter(
    (semester) => semester.school_year_id === schoolYearId,
  );

  const createClass = useKinderMutation({
    mutationFn: createClassAction,
    invalidateKeys: [kinderQueryKeys.classes.all(schoolId)],
    onSuccess: () => {
      form.reset({
        schoolId,
        schoolYearId: defaultSchoolYearId,
        semesterId: '',
        classroomId: '',
        campusId: '',
        name: '',
        code: '',
        capacity: 25,
        teacherUserId: '',
      });
      setOpen(false);
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:classes.createDescription" />}
      footer={
        <KinderSubmitButton
          loading={createClass.isPending}
          onClick={form.handleSubmit((data) => createClass.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:classes.create" />
        </KinderSubmitButton>
      }
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:classes.create" />}
      trigger={
        <Button className="rounded-lg" type="button">
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:classes.create" />
        </Button>
      }
    >
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="schoolYearId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.schoolYear" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {schoolYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.name" />
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.code" />
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
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.capacity" />
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="semesterId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.semester" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSemesters.map((semester) => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name}
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
            name="classroomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.classroom" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {classrooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teacherUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.teacher" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </KinderFormDialog>
  );
}

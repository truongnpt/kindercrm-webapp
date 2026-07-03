'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil } from 'lucide-react';
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
import { UpdateClassSchema } from '~/lib/kinder/classes/schemas/class.schema';
import {
  assignTeacherAction,
  updateClassAction,
} from '~/lib/kinder/classes/server-actions';
import type { ClassGroup } from '~/lib/kinder/classes/types';

export function EditClassDialog({
  cls,
  schoolId,
  teachers,
  open: controlledOpen,
  onOpenChange,
  trigger,
  hideTrigger,
}: {
  cls: ClassGroup;
  schoolId: string;
  teachers: Array<{ id: string; name: string }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  hideTrigger?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm({
    resolver: zodResolver(UpdateClassSchema),
    defaultValues: {
      classId: cls.id,
      schoolId,
      name: cls.name,
      code: cls.code,
      capacity: cls.capacity,
      semesterId: cls.semester_id ?? '',
      classroomId: cls.classroom_id ?? '',
      teacherUserId: cls.teacher_user_id ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        classId: cls.id,
        schoolId,
        name: cls.name,
        code: cls.code,
        capacity: cls.capacity,
        semesterId: cls.semester_id ?? '',
        classroomId: cls.classroom_id ?? '',
        teacherUserId: cls.teacher_user_id ?? '',
      });
    }
  }, [open, cls, schoolId, form]);

  const updateClass = useKinderMutation({
    mutationFn: updateClassAction,
    invalidateKeys: [kinderQueryKeys.classes.detail(schoolId, cls.id)],
    onSuccess: () => setOpen(false),
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:classes.editClassDescription" />}
      onOpenChange={setOpen}
      open={open}
      size="md"
      title={<Trans i18nKey="kinder:classes.editClass" />}
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
      footer={
        <KinderSubmitButton
          loading={updateClass.isPending}
          onClick={form.handleSubmit((data) => updateClass.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:classes.save" />
        </KinderSubmitButton>
      }
    >
      <Form {...form}>
        <form className="grid gap-4">
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
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
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
                </FormItem>
              )}
            />
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
          </div>
          <FormField
            control={form.control}
            name="teacherUserId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:classes.teacher" />
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    void assignTeacherAction({
                      classId: cls.id,
                      schoolId,
                      teacherUserId: value,
                    });
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-lg">
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

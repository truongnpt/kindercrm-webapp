'use client';

import { useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import {
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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { CreateStudentSchema } from '~/lib/kinder/students/schemas/student.schema';
import {
  createStudentAction,
  setStudentPhotoAction,
} from '~/lib/kinder/students/server-actions';
import { uploadStudentPhoto } from '~/lib/kinder/students/upload-student-photo';
import { ensureStorageQuotaBeforeUpload } from '~/lib/kinder/subscription/ensure-storage-quota-before-upload';
import { formatQuotaMutationError } from '~/lib/kinder/subscription/quota-limit-messages';
import type { QuotaFormSummary } from '~/lib/kinder/subscription/quotas';

import { QuotaLimitBanner } from '../../_components/quota-limit-banner';
import { StudentPhotoField } from './student-photo-field';

export function CreateStudentDialog({
  schoolId,
  quotaSummary,
}: {
  schoolId: string;
  quotaSummary: QuotaFormSummary;
}) {
  const { t } = useTranslation('kinder');
  const router = useRouter();
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);
  const pendingPhotoRef = useRef<File | null>(null);

  const form = useForm({
    resolver: zodResolver(CreateStudentSchema),
    defaultValues: {
      schoolId,
      fullName: '',
      studentCode: '',
      dateOfBirth: '',
      className: '',
      enrollmentDate: new Date().toISOString().slice(0, 10),
      notes: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
    },
  });

  const createStudent = useKinderMutation({
    mutationFn: createStudentAction,
    invalidateKeys: [kinderQueryKeys.students.list(schoolId)],
    refresh: false,
    toast: {
      error: (error) =>
        formatQuotaMutationError(t, error, quotaSummary) ?? t('ui.toast.error'),
    },
    onSuccess: async (result) => {
      const studentId = result?.studentId;

      if (studentId && pendingPhotoRef.current) {
        try {
          await ensureStorageQuotaBeforeUpload(
            schoolId,
            pendingPhotoRef.current.size,
          );

          const photoUrl = await uploadStudentPhoto(supabase, {
            schoolId,
            studentId,
            file: pendingPhotoRef.current,
          });

          await setStudentPhotoAction({
            schoolId,
            studentId,
            photoUrl,
          });
        } catch {
          // Student was created; photo can be added later from the profile.
        }
      }

      pendingPhotoRef.current = null;
      form.reset({
        schoolId,
        fullName: '',
        studentCode: '',
        dateOfBirth: '',
        className: '',
        enrollmentDate: new Date().toISOString().slice(0, 10),
        notes: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
      });
      setOpen(false);

      if (studentId) {
        router.push(`${pathsConfig.app.studentDetail}/${studentId}`);
      }
    },
  });

  return (
    <KinderFormDialog
      description={<Trans i18nKey="kinder:students.description" />}
      onOpenChange={setOpen}
      open={open}
      size="lg"
      title={<Trans i18nKey="kinder:students.create" />}
      trigger={
        <Button disabled={quotaSummary.students.atLimit}>
          <Plus className="mr-2 size-4" />
          <Trans i18nKey="kinder:students.create" />
        </Button>
      }
      footer={
        <KinderSubmitButton
          disabled={quotaSummary.students.atLimit}
          loading={createStudent.isPending}
          onClick={form.handleSubmit((data) => createStudent.mutate(data))}
          type="button"
        >
          <Trans i18nKey="kinder:students.create" />
        </KinderSubmitButton>
      }
    >
      <QuotaLimitBanner
        atLimit={quotaSummary.students.atLimit}
        currentPackageName={quotaSummary.currentPackageName}
        kind="students"
        max={quotaSummary.limits.maxStudents}
        nearLimit={quotaSummary.students.nearLimit}
        suggestedPackageName={quotaSummary.students.suggestedPackageName}
        used={quotaSummary.usage.students}
      />
      <Form {...form}>
        <form className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.fullName" />
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
            name="studentCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.code" />
                </FormLabel>
                <FormControl>
                  <Input placeholder="Tự động nếu để trống" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:students.dateOfBirth" />
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:students.gender" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">
                        <Trans i18nKey="kinder:students.genderMale" />
                      </SelectItem>
                      <SelectItem value="female">
                        <Trans i18nKey="kinder:students.genderFemale" />
                      </SelectItem>
                      <SelectItem value="other">
                        <Trans i18nKey="kinder:students.genderOther" />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="className"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.className" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <StudentPhotoField
            fullName={form.watch('fullName')}
            onChange={() => undefined}
            onPendingFileChange={(file) => {
              pendingPhotoRef.current = file;
            }}
            schoolId={schoolId}
          />

          <FormField
            control={form.control}
            name="parentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.parentName" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:crm.phone" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:students.notes" />
                </FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </KinderFormDialog>
  );
}

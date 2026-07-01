'use client';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Trans } from '@kit/ui/trans';

import { TransferStudentSchema } from '~/lib/kinder/classes/schemas/class.schema';
import { transferStudentAction } from '~/lib/kinder/classes/server-actions';

export function TransferStudentDialog({
  schoolId,
  fromClassId,
  studentId,
  studentName,
  allClasses,
}: {
  schoolId: string;
  fromClassId: string;
  studentId: string;
  studentName: string;
  allClasses: Array<{ id: string; name: string; code: string }>;
}) {
  const { t } = useTranslation('kinder');
  const options = allClasses.filter((cls) => cls.id !== fromClassId);

  const form = useForm({
    resolver: zodResolver(TransferStudentSchema),
    defaultValues: {
      schoolId,
      studentId,
      fromClassId,
      toClassId: '',
    },
  });

  if (options.length === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" type="button" variant="outline">
          <Trans i18nKey="kinder:classes.transferStudent" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans
              i18nKey="kinder:classes.transferStudentTitle"
              values={{ name: studentName }}
            />
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (data) => {
              const promise = transferStudentAction(data);
              toast.promise(promise, {
                loading: t('schoolSettings.saving'),
                success: t('classes.transferred'),
                error: t('kinder:errors.classCapacity'),
              });
              await promise;
            })}
          >
            <FormField
              control={form.control}
              name="toClassId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.targetClass" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {options.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} ({cls.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <Button disabled={!form.watch('toClassId')} type="submit">
              <Trans i18nKey="kinder:classes.transferStudent" />
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

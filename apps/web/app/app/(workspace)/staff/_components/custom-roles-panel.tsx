'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';

import {
  KinderConfirmDialog,
  kinderQueryKeys,
  useKinderMutation,
} from '~/components/kinder-ui';
import {
  createSchoolCustomRoleAction,
  deleteSchoolCustomRoleAction,
  type SchoolCustomRole,
} from '~/lib/kinder/permissions';

const CreateCustomRoleSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export function CustomRolesPanel({
  schoolId,
  customRoles,
}: {
  schoolId: string;
  customRoles: SchoolCustomRole[];
}) {
  const { t } = useTranslation('kinder');
  const [open, setOpen] = useState(false);
  const [deleteRole, setDeleteRole] = useState<SchoolCustomRole | null>(null);

  const form = useForm<z.infer<typeof CreateCustomRoleSchema>>({
    resolver: zodResolver(CreateCustomRoleSchema),
    defaultValues: { name: '', slug: '' },
  });

  const createRole = useKinderMutation({
    mutationFn: createSchoolCustomRoleAction,
    invalidateKeys: [kinderQueryKeys.staff.all(schoolId)],
    onSuccess: () => {
      toast.success(t('permissions.customRoles.created'));
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeRole = useKinderMutation({
    mutationFn: deleteSchoolCustomRoleAction,
    invalidateKeys: [kinderQueryKeys.staff.all(schoolId)],
    onSuccess: () => {
      toast.success(t('permissions.customRoles.deleted'));
      setDeleteRole(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="border-b border-border px-5 py-4 sm:px-6">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            <Trans i18nKey="kinder:permissions.customRoles.title" />
          </h3>
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:permissions.customRoles.description" />
          </p>
        </div>

        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button className="rounded-full" size="sm" type="button">
              <Plus className="mr-2 size-4" />
              <Trans i18nKey="kinder:permissions.customRoles.add" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Trans i18nKey="kinder:permissions.customRoles.add" />
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((values) =>
                  createRole.mutate({
                    schoolId,
                    name: values.name,
                    slug: values.slug,
                  }),
                )}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:permissions.customRoles.name" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(event) => {
                            field.onChange(event);
                            if (!form.getValues('slug')) {
                              form.setValue(
                                'slug',
                                slugifyName(event.target.value),
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Trans i18nKey="kinder:permissions.customRoles.slug" />
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    disabled={createRole.isPending}
                    type="submit"
                  >
                    <Trans i18nKey="kinder:permissions.customRoles.create" />
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {customRoles.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {customRoles.map((role) => (
            <div
              className="bg-muted/40 flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm"
              key={role.id}
            >
              <span className="font-medium">{role.name}</span>
              <Button
                className="size-7 rounded-full"
                onClick={() => setDeleteRole(role)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          <Trans i18nKey="kinder:permissions.customRoles.empty" />
        </p>
      )}

      <KinderConfirmDialog
        confirmLabel={<Trans i18nKey="kinder:ui.delete" />}
        description={
          <Trans
            i18nKey="kinder:permissions.customRoles.deleteConfirm"
            values={{ name: deleteRole?.name ?? '' }}
          />
        }
        onConfirm={() =>
          deleteRole
            ? removeRole.mutate({
                schoolId,
                customRoleId: deleteRole.id,
              })
            : undefined
        }
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeleteRole(null);
          }
        }}
        open={Boolean(deleteRole)}
        pending={removeRole.isPending}
        title={<Trans i18nKey="kinder:permissions.customRoles.deleteTitle" />}
      />
    </div>
  );
}

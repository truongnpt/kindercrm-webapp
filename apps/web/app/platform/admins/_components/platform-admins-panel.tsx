'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Badge } from '@kit/ui/badge';
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

import { DataTableShell } from '~/components/kinder-ui';
import { GrantPlatformAdminSchema } from '~/lib/kinder/platform/schemas/package.schema';
import {
  platformGrantAdminAction,
  platformRevokeAdminAction,
} from '~/lib/kinder/platform/platform-ops-actions';
import type { PlatformAdminListItem } from '~/lib/kinder/platform/types';

export function PlatformAdminsPanel({
  admins,
  currentUserId,
}: {
  admins: PlatformAdminListItem[];
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(GrantPlatformAdminSchema),
    defaultValues: {
      email: '',
      role: 'support' as const,
      notes: '',
    },
  });

  return (
    <div className="space-y-4">
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button type="button">
            <Plus className="mr-2 size-4" />
            <Trans i18nKey="kinder:platform.admins.grant" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Trans i18nKey="kinder:platform.admins.grantTitle" />
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                await platformGrantAdminAction(values);
                setOpen(false);
                form.reset();
                router.refresh();
              })}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" type="submit">
                <Trans i18nKey="kinder:platform.admins.grant" />
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DataTableShell>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-right" />
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>
                  <p className="font-medium">{admin.name ?? '—'}</p>
                  <p className="text-muted-foreground text-xs">{admin.email}</p>
                </td>
                <td>{admin.role}</td>
                <td>
                  <Badge variant={admin.is_active ? 'default' : 'secondary'}>
                    {admin.is_active ? 'Active' : 'Revoked'}
                  </Badge>
                </td>
                <td className="text-right">
                  {admin.is_active && admin.user_id !== currentUserId ? (
                    <Button
                      onClick={async () => {
                        await platformRevokeAdminAction({
                          platformAdminId: admin.id,
                        });
                        router.refresh();
                      }}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Trans i18nKey="kinder:platform.admins.revoke" />
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableShell>
    </div>
  );
}

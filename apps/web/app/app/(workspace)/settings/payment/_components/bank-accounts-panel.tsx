'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Star, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
import { Switch } from '@kit/ui/switch';
import { Trans } from '@kit/ui/trans';

import { DataTableShell, PanelEmpty } from '~/components/kinder-ui';
import { UpsertPaymentAccountSchema } from '~/lib/kinder/payment-settings/schemas/payment-settings.schema';
import {
  deactivatePaymentAccountAction,
  setDefaultPaymentAccountAction,
  upsertPaymentAccountAction,
} from '~/lib/kinder/payment-settings/server-actions';
import type { PaymentAccount } from '~/lib/kinder/payment-settings/types';

type CampusOption = { id: string; name: string };

export function BankAccountsPanel({
  schoolId,
  accounts,
  campuses,
}: {
  schoolId: string;
  accounts: PaymentAccount[];
  campuses: CampusOption[];
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentAccount | null>(null);

  const form = useForm({
    resolver: zodResolver(UpsertPaymentAccountSchema),
    defaultValues: {
      schoolId,
      bankName: '',
      bankCode: '',
      accountNumber: '',
      accountName: '',
      branch: '',
      campusId: '',
      isDefault: false,
      status: 'active' as const,
    },
  });

  const resetForm = (account?: PaymentAccount | null) => {
    form.reset({
      schoolId,
      accountId: account?.id,
      bankName: account?.bank_name ?? '',
      bankCode: account?.bank_code ?? '',
      accountNumber: account?.account_number ?? '',
      accountName: account?.account_name ?? '',
      branch: account?.branch ?? '',
      campusId: account?.campus_id ?? '',
      isDefault: account?.is_default ?? false,
      status: account?.status ?? 'active',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Dialog
          onOpenChange={(next) => {
            setOpen(next);

            if (!next) {
              setEditing(null);
              resetForm(null);
            }
          }}
          open={open}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditing(null);
                resetForm(null);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              <Trans i18nKey="kinder:paymentSettings.addAccount" />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                <Trans
                  i18nKey={
                    editing ?
                      'kinder:paymentSettings.editAccount'
                    : 'kinder:paymentSettings.addAccount'
                  }
                />
              </DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (data) => {
                  await upsertPaymentAccountAction({
                    ...data,
                    campusId: data.campusId === 'none' ? '' : data.campusId,
                  });
                  setOpen(false);
                  setEditing(null);
                  resetForm(null);
                })}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>
                          <Trans i18nKey="kinder:paymentSettings.bankName" />
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
                    name="bankCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:paymentSettings.bankCode" />
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="970422" required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Trans i18nKey="kinder:paymentSettings.accountNumber" />
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
                    name="accountName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>
                          <Trans i18nKey="kinder:paymentSettings.accountName" />
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
                    name="branch"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>
                          <Trans i18nKey="kinder:paymentSettings.branch" />
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
                    name="campusId"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>
                          <Trans i18nKey="kinder:paymentSettings.campus" />
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || 'none'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">
                              <Trans i18nKey="kinder:paymentSettings.allCampuses" />
                            </SelectItem>
                            {campuses.map((campus) => (
                              <SelectItem key={campus.id} value={campus.id}>
                                {campus.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isDefault"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
                        <FormLabel className="mb-0">
                          <Trans i18nKey="kinder:paymentSettings.setDefault" />
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Button className="w-full" type="submit">
                  <Trans i18nKey="common:save" />
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {accounts.length === 0 ? (
        <PanelEmpty messageKey="kinder:paymentSettings.accountsEmpty" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <div
              className="rounded-xl border border-border bg-card p-4"
              key={account.id}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{account.bank_name}</p>
                  <p className="text-muted-foreground mt-1 font-mono text-sm">
                    {account.account_number}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {account.is_default ? (
                    <Badge variant="secondary">
                      <Star className="mr-1 size-3" />
                      <Trans i18nKey="kinder:paymentSettings.default" />
                    </Badge>
                  ) : null}
                  <Badge
                    variant={
                      account.status === 'active' ? 'default' : 'outline'
                    }
                  >
                    <Trans
                      i18nKey={`kinder:paymentSettings.accountStatus.${account.status}`}
                    />
                  </Badge>
                </div>
              </div>

              <p className="mt-2 text-sm">{account.account_name}</p>
              {account.branch ? (
                <p className="text-muted-foreground mt-1 text-xs">
                  {account.branch}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {!account.is_default && account.status === 'active' ? (
                  <Button
                    onClick={() =>
                      setDefaultPaymentAccountAction({
                        schoolId,
                        accountId: account.id,
                      })
                    }
                    size="sm"
                    variant="outline"
                  >
                    <Trans i18nKey="kinder:paymentSettings.makeDefault" />
                  </Button>
                ) : null}
                <Button
                  onClick={() => {
                    setEditing(account);
                    resetForm(account);
                    setOpen(true);
                  }}
                  size="sm"
                  variant="outline"
                >
                  <Trans i18nKey="common:edit" />
                </Button>
                <Button
                  onClick={() =>
                    deactivatePaymentAccountAction({
                      schoolId,
                      accountId: account.id,
                    })
                  }
                  size="sm"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

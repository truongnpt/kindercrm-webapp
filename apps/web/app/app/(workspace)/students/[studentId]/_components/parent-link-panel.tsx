'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
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

import { LinkParentAccountSchema } from '~/lib/kinder/parent/schemas/parent.schema';
import { PanelEmpty } from '~/components/kinder-ui';
import {
  linkParentAccountAction,
  unlinkParentAccountAction,
} from '~/lib/kinder/parent/server-actions';

export function ParentLinkPanel({
  schoolId,
  studentId,
  parentLinks,
}: {
  schoolId: string;
  studentId: string;
  parentLinks: Array<{
    id: string;
    email?: string | null;
    relationship: string;
    is_primary: boolean;
    account: { id: string; name: string | null; email: string | null } | null;
  }>;
}) {
  const { t } = useTranslation('kinder');

  const form = useForm({
    resolver: zodResolver(LinkParentAccountSchema),
    defaultValues: {
      schoolId,
      studentId,
      email: '',
      relationship: 'guardian',
      isPrimary: false,
    },
  });

  return (
    <section className="space-y-3">
      <h3 className="font-semibold">
        <Trans i18nKey="kinder:parent.portalAccess" />
      </h3>

      {parentLinks.length > 0 ? (
        <ul className="kinder-list-panel">
          {parentLinks.map((link) => (
            <li
              className="flex items-center justify-between gap-2 p-3 text-sm"
              key={link.id}
            >
              <div>
                <p className="font-medium">
                  {link.account?.name ?? link.account?.email ?? '—'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {link.account?.email}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {link.is_primary ? (
                  <Badge variant="secondary">
                    <Trans i18nKey="kinder:parent.primary" />
                  </Badge>
                ) : null}
                <Button
 onClick={async () => {
                    const promise = unlinkParentAccountAction({
                      schoolId,
                      studentId,
                      linkId: link.id,
                    });
                    toast.promise(promise, {
                      loading: t('schoolSettings.saving'),
                      success: t('parent.unlinked'),
                      error: t('common:genericServerError', { ns: 'common' }),
                    });
                    await promise;
                  }}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trans i18nKey="kinder:parent.unlink" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <PanelEmpty messageKey="kinder:parent.noLinks" />
      )}

      <Form {...form}>
        <form
          className="kinder-form-panel sm:grid-cols-2"
          onSubmit={form.handleSubmit(async (data) => {
            const promise = linkParentAccountAction(data);
            toast.promise(
              promise.then((result) => {
                if (result?.invited) {
                  return t('parent.inviteSent');
                }
                return t('parent.linked');
              }),
              {
                loading: t('schoolSettings.saving'),
                success: (message) => message,
                error: t('common:genericServerError', { ns: 'common' }),
              },
            );
            await promise;
            form.reset({
              schoolId,
              studentId,
              email: '',
              relationship: 'guardian',
              isPrimary: false,
            });
          })}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  <Trans i18nKey="kinder:parent.linkEmail" />
                </FormLabel>
                <FormControl>
                  <Input placeholder="parent@email.com" type="email" {...field} required />
                </FormControl>
              </FormItem>
            )}
          />
          <Button className="sm:col-span-2" type="submit">
            <Trans i18nKey="kinder:parent.linkAccount" />
          </Button>
        </form>
      </Form>
    </section>
  );
}

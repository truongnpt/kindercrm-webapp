'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, MapPin, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Separator } from '@kit/ui/separator';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { CreateSchoolSchema } from '~/lib/kinder/tenant/schemas/school.schema';
import { createSchoolAction } from '~/lib/kinder/tenant/server-actions';
import { slugifySchoolName } from '~/lib/kinder/tenant/slugify';
import { getRedirectUrlFromError } from '~/lib/kinder/react-query/redirect-error';

export function CreateSchoolForm({
  defaultEmail,
}: {
  defaultEmail?: string | null;
}) {
  const { t } = useTranslation(['kinder', 'common']);
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm({
    resolver: zodResolver(CreateSchoolSchema),
    defaultValues: {
      name: '',
      slug: '',
      phone: '',
      email: defaultEmail ?? '',
      address: '',
      campusName: t('onboarding.defaultCampusName'),
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          <Trans i18nKey="kinder:onboarding.title" />
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          <Trans i18nKey="kinder:onboarding.description" />
        </p>
      </div>

      <Form {...form}>
        <form
          className="flex flex-col gap-6"
          onSubmit={form.handleSubmit((data) => {
            startTransition(async () => {
              const promise = createSchoolAction(data).catch((error: unknown) => {
                const redirectUrl = getRedirectUrlFromError(error);

                if (redirectUrl) {
                  router.push(redirectUrl);
                  router.refresh();
                  return;
                }

                throw error;
              });

              toast.promise(promise, {
                loading: t('kinder:onboarding.creating'),
                success: t('kinder:onboarding.created'),
                error: t('common:genericServerError', { ns: 'common' }),
              });

              await promise;

              router.refresh();
            });
          })}
        >
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="size-4" />
              </span>
              <h3 className="onboarding-section-title">
                <Trans i18nKey="kinder:onboarding.sections.school" />
              </h3>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:onboarding.schoolName" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-11 rounded-xl"
                      onChange={(event) => {
                        field.onChange(event);

                        if (!slugTouched) {
                          form.setValue(
                            'slug',
                            slugifySchoolName(event.target.value),
                          );
                        }
                      }}
                      required
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
                    <Trans i18nKey="kinder:onboarding.schoolSlug" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-11 rounded-xl font-mono text-sm"
                      onChange={(event) => {
                        setSlugTouched(true);
                        field.onChange(event);
                      }}
                      required
                    />
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="kinder:onboarding.schoolSlugHint" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="campusName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:onboarding.campusName" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className="h-11 rounded-xl" required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <Separator />

          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Phone className="size-4" />
              </span>
              <h3 className="onboarding-section-title">
                <Trans i18nKey="kinder:onboarding.sections.contact" />
              </h3>
            </div>

            <div className="onboarding-field-grid">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:onboarding.phone" />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:onboarding.email" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11 rounded-xl"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="inline-flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <Trans i18nKey="kinder:onboarding.address" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-24 rounded-xl"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <Button className="min-h-11 w-full"
 disabled={pending}
 type="submit"
 >
            {pending ? t('kinder:onboarding.creating') : t('kinder:onboarding.submit')}
          </Button>
        </form>
      </Form>
    </div>
  );
}

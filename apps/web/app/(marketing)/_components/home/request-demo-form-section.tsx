'use client';

import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2, Mail, MessageSquareText, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  FadeIn,
  MarketingSection,
  SectionHeader,
} from '~/components/marketing';
import {
  createSubmitDemoRequestSchema,
  type SubmitDemoRequestInput,
} from '~/lib/kinder/marketing/schemas/request-demo.schema';

export function RequestDemoFormSection() {
  const { t, i18n } = useTranslation('marketing');
  const [submitting, setSubmitting] = useState(false);
  const locale = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const schema = useMemo(
    () => createSubmitDemoRequestSchema(locale),
    [locale],
  );

  const form = useForm<SubmitDemoRequestInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      schoolName: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (values: SubmitDemoRequestInput) => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/marketing/request-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      form.reset();
      toast.success(t('requestDemoForm.submitSuccess'));
    } catch (error) {
      console.error('[request-demo] submit failed', error);
      toast.error(t('requestDemoForm.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MarketingSection id="request-demo" alt>
      <SectionHeader
        eyebrow={<Trans i18nKey="marketing:requestDemoForm.eyebrow" />}
        title={<Trans i18nKey="marketing:requestDemoForm.title" />}
        subtitle={<Trans i18nKey="marketing:requestDemoForm.subtitle" />}
        className="mb-10"
      />

      <FadeIn>
        <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto grid w-full max-w-5xl gap-0 overflow-hidden rounded-3xl bg-white/95 shadow-[0_36px_90px_rgba(3,76,248,0.14),0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-sm duration-700 lg:grid-cols-[1fr_1.3fr]">
          <div className="bg-[var(--marketing-section)]/85 p-6 sm:p-8">
            <span className="inline-flex rounded-full border border-[var(--marketing-primary)]/20 bg-[var(--marketing-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--marketing-primary)]">
              <Trans i18nKey="marketing:ctaRequestDemo" />
            </span>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--marketing-text)]">
              <Trans i18nKey="marketing:requestDemoForm.title" />
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--marketing-text-muted)]">
              <Trans i18nKey="marketing:requestDemoForm.subtitle" />
            </p>

            <div className="mt-6 space-y-3">
              <InfoItem
                icon={Building2}
                label={<Trans i18nKey="marketing:requestDemoForm.schoolName" />}
              />
              <InfoItem
                icon={Mail}
                label={<Trans i18nKey="marketing:requestDemoForm.email" />}
              />
              <InfoItem
                icon={Phone}
                label={<Trans i18nKey="marketing:requestDemoForm.phone" />}
              />
              <InfoItem
                icon={MessageSquareText}
                label={<Trans i18nKey="marketing:requestDemoForm.message" />}
              />
            </div>
          </div>

          <div className="p-5 sm:p-8 md:p-10">
          <Form {...form}>
            <form
              className="grid gap-5 sm:grid-cols-2"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="schoolName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[var(--marketing-text)]">
                      <Trans i18nKey="marketing:requestDemoForm.schoolName" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="h-11 rounded-xl border-transparent bg-white px-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] transition-all duration-200 focus-visible:shadow-[inset_0_0_0_2px_rgba(3,76,248,0.45),0_0_0_4px_rgba(3,76,248,0.08)]"
                      />
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
                    <FormLabel className="text-sm font-semibold text-[var(--marketing-text)]">
                      <Trans i18nKey="marketing:requestDemoForm.email" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        inputMode="email"
                        type="email"
                        {...field}
                        className="h-11 rounded-xl border-transparent bg-white px-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] transition-all duration-200 focus-visible:shadow-[inset_0_0_0_2px_rgba(3,76,248,0.45),0_0_0_4px_rgba(3,76,248,0.08)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-sm font-semibold text-[var(--marketing-text)]">
                      <Trans i18nKey="marketing:requestDemoForm.phone" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        inputMode="tel"
                        {...field}
                        className="h-11 rounded-xl border-transparent bg-white px-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] transition-all duration-200 focus-visible:shadow-[inset_0_0_0_2px_rgba(3,76,248,0.45),0_0_0_4px_rgba(3,76,248,0.08)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-sm font-semibold text-[var(--marketing-text)]">
                      <Trans i18nKey="marketing:requestDemoForm.message" />
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        {...field}
                        className="min-h-[140px] rounded-xl border-transparent bg-white px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)] transition-all duration-200 focus-visible:shadow-[inset_0_0_0_2px_rgba(3,76,248,0.45),0_0_0_4px_rgba(3,76,248,0.08)]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-1 flex items-center justify-between gap-3 sm:col-span-2">
                <p className="text-xs leading-relaxed text-[var(--marketing-text-muted)]">
                  <Trans i18nKey="marketing:privacyPolicy" /> · <Trans i18nKey="marketing:termsOfService" />
                </p>
                <Button
                  className="h-11 w-full rounded-xl px-6 shadow-[0_12px_28px_rgba(3,76,248,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(3,76,248,0.3)] sm:w-auto"
                  disabled={submitting}
                  type="submit"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      <Trans i18nKey="marketing:requestDemoForm.submitting" />
                    </>
                  ) : (
                    <Trans i18nKey="marketing:requestDemoForm.submit" />
                  )}
                </Button>
              </div>
            </form>
          </Form>
          </div>
        </div>
      </FadeIn>
    </MarketingSection>
  );
}

function InfoItem({
  icon: Icon,
  label,
}: {
  icon: typeof Building2;
  label: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.22)]">
      <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--marketing-primary)]/10 text-[var(--marketing-primary)]">
        <Icon className="size-4" />
      </span>
      <span className="text-sm font-medium text-[var(--marketing-text)]">{label}</span>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
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
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import { SectionCard } from '~/components/kinder-ui';
import { UpdateSchoolSchema } from '~/lib/kinder/tenant/schemas/school.schema';
import { updateSchoolAction } from '~/lib/kinder/tenant/server-actions';
import type { School } from '~/lib/kinder/types';

const SCHOOL_LOGO_BUCKET = 'daily_report_media';
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export function UpdateSchoolForm({ school }: { school: School }) {
  const { t } = useTranslation('kinder');
  const supabase = useSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const form = useForm({
    resolver: zodResolver(UpdateSchoolSchema),
    defaultValues: {
      schoolId: school.id,
      name: school.name,
      phone: school.phone ?? '',
      email: school.email ?? '',
      address: school.address ?? '',
      logoUrl: school.logo_url ?? '',
      themePrimaryColor: school.theme_primary_color ?? '',
      customDomain: school.custom_domain ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const promise = updateSchoolAction(data);

    toast.promise(promise, {
      loading: t('schoolSettings.saving'),
      success: t('schoolSettings.saved'),
      error: t('common:genericServerError', { ns: 'common' }),
    });

    await promise;
  });

  const handleUploadLogo = async (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(t('schoolSettings.logoTypeError'));
      return;
    }

    setUploadingLogo(true);

    try {
      const extension = file.name.split('.').pop() ?? 'png';
      const fileName = `${crypto.randomUUID()}.${extension}`;
      // Keep school UUID as first path segment for storage RLS policies.
      const path = `${school.id}/school-logos/${fileName}`;
      const bytes = await file.arrayBuffer();

      const upload = await supabase.storage
        .from(SCHOOL_LOGO_BUCKET)
        .upload(path, bytes, {
          contentType: file.type,
          upsert: false,
        });

      if (upload.error) {
        throw upload.error;
      }

      const logoUrl = supabase.storage
        .from(SCHOOL_LOGO_BUCKET)
        .getPublicUrl(path).data.publicUrl;

      form.setValue('logoUrl', logoUrl, { shouldDirty: true, shouldValidate: true });
      toast.success(t('schoolSettings.logoUploaded'));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t('common:genericServerError', { ns: 'common' }),
      );
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Form {...form}>
      <form className="flex max-w-3xl flex-col gap-4" onSubmit={onSubmit}>
        <SectionCard title={<Trans i18nKey="kinder:schoolSettings.basicInfoTitle" />}>
          <p className="text-muted-foreground mb-4 text-sm">
            <Trans i18nKey="kinder:schoolSettings.basicInfoHint" />
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <Trans i18nKey="kinder:schoolSettings.name" />
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:schoolSettings.phone" />
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:schoolSettings.email" />
                  </FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <Trans i18nKey="kinder:schoolSettings.address" />
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        <SectionCard title={<Trans i18nKey="kinder:schoolSettings.brandingTitle" />}>
          <p className="text-muted-foreground mb-4 text-sm">
            <Trans i18nKey="kinder:schoolSettings.brandingHint" />
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <Trans i18nKey="kinder:schoolSettings.logoUpload" />
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <input
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            void handleUploadLogo(file);
                          }
                        }}
                        ref={fileInputRef}
                        type="file"
                      />

                      {field.value ? (
                        <div className="border-border bg-muted/20 flex items-center gap-3 rounded-lg border p-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt="School logo"
                            className="size-14 rounded-md border object-cover"
                            src={field.value}
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              disabled={uploadingLogo}
                              onClick={() => fileInputRef.current?.click()}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              {uploadingLogo ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                              ) : (
                                <ImagePlus className="mr-2 size-4" />
                              )}
                              <Trans i18nKey="kinder:schoolSettings.changeLogo" />
                            </Button>
                            <Button
                              onClick={() =>
                                form.setValue('logoUrl', '', {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                              size="sm"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 className="mr-2 size-4" />
                              <Trans i18nKey="kinder:schoolSettings.removeLogo" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          disabled={uploadingLogo}
                          onClick={() => fileInputRef.current?.click()}
                          type="button"
                          variant="outline"
                        >
                          {uploadingLogo ? (
                            <Loader2 className="mr-2 size-4 animate-spin" />
                          ) : (
                            <ImagePlus className="mr-2 size-4" />
                          )}
                          <Trans i18nKey="kinder:schoolSettings.uploadLogo" />
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="kinder:schoolSettings.logoHint" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="themePrimaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:schoolSettings.themeColor" />
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        className="h-10 w-14 cursor-pointer p-1"
                        onChange={(event) => field.onChange(event.target.value)}
                        type="color"
                        value={field.value || '#2563eb'}
                      />
                      <Input
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder="#2563eb"
                        value={field.value}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="kinder:schoolSettings.themeColorHint" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        <SectionCard title={<Trans i18nKey="kinder:schoolSettings.domainTitle" />}>
          <p className="text-muted-foreground mb-4 text-sm">
            <Trans i18nKey="kinder:schoolSettings.domainHint" />
          </p>
          <FormField
            control={form.control}
            name="customDomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:schoolSettings.customDomain" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </SectionCard>

        <Button type="submit">
          <Trans i18nKey="kinder:schoolSettings.save" />
        </Button>
      </form>
    </Form>
  );
}

'use client';

import { useCallback, useRef, useState } from 'react';

import { ImageIcon, Trash2, VideoIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import {
  deleteDailyReportAttachmentAction,
  registerDailyReportAttachmentAction,
} from '~/lib/kinder/daily-reports/server-actions';
import {
  buildDailyReportStoragePath,
  DAILY_REPORT_MEDIA_BUCKET,
  validateDailyReportMediaFile,
} from '~/lib/kinder/daily-reports/storage';
import type { DailyReportAttachment } from '~/lib/kinder/daily-reports/types';
import { PanelEmpty } from '~/components/kinder-ui';

async function captureVideoThumbnail(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration / 2);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          resolve(blob);
        },
        'image/jpeg',
        0.8,
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
  });
}

export function DailyReportMediaPanel({
  schoolId,
  reportId,
  attachments,
  readOnly = false,
}: {
  schoolId: string;
  reportId: string | null;
  attachments: DailyReportAttachment[];
  readOnly?: boolean;
}) {
  const { t } = useTranslation('kinder');
  const router = useRouter();
  const client = useSupabase();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const getPublicUrl = useCallback(
    (storagePath: string) => {
      return client.storage
        .from(DAILY_REPORT_MEDIA_BUCKET)
        .getPublicUrl(storagePath).data.publicUrl;
    },
    [client],
  );

  const onUpload = async (file: File) => {
    if (!reportId) {
      toast.error(t('dailyReports.saveBeforeMedia'));
      return;
    }

    setUploading(true);

    try {
      const mediaType = validateDailyReportMediaFile(file);
      const extension = file.name.split('.').pop() ?? 'bin';
      const fileName = `${crypto.randomUUID()}.${extension}`;
      const storagePath = buildDailyReportStoragePath(
        schoolId,
        reportId,
        fileName,
      );

      const bytes = await file.arrayBuffer();
      const uploadResult = await client.storage
        .from(DAILY_REPORT_MEDIA_BUCKET)
        .upload(storagePath, bytes, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadResult.error) {
        throw uploadResult.error;
      }

      let thumbnailPath: string | undefined;

      if (mediaType === 'video') {
        const thumbnailBlob = await captureVideoThumbnail(file);

        if (thumbnailBlob) {
          const thumbName = `thumb_${fileName.replace(/\.[^.]+$/, '')}.jpg`;
          const thumbStoragePath = buildDailyReportStoragePath(
            schoolId,
            reportId,
            thumbName,
          );
          const thumbBytes = await thumbnailBlob.arrayBuffer();
          const thumbResult = await client.storage
            .from(DAILY_REPORT_MEDIA_BUCKET)
            .upload(thumbStoragePath, thumbBytes, {
              contentType: 'image/jpeg',
              upsert: false,
            });

          if (!thumbResult.error) {
            thumbnailPath = thumbStoragePath;
          }
        }
      }

      const promise = registerDailyReportAttachmentAction({
        schoolId,
        reportId,
        storagePath,
        fileName: file.name,
        mediaType,
        mimeType: file.type,
        fileSize: file.size,
        thumbnailPath,
        caption: '',
      });

      toast.promise(promise, {
        loading: t('schoolSettings.saving'),
        success: t('dailyReports.mediaUploaded'),
        error: t('common:genericServerError', { ns: 'common' }),
      });

      await promise;
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('common:genericServerError', { ns: 'common' }),
      );
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {!readOnly ? (
        <div className="flex items-center gap-2">
          <input
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                void onUpload(file);
              }
            }}
            ref={inputRef}
            type="file"
          />
          <Button
 disabled={uploading || !reportId}
 onClick={() => inputRef.current?.click()}
            size="sm"
            type="button"
            variant="outline"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            <Trans i18nKey="kinder:dailyReports.uploadMedia" />
          </Button>
          {!reportId ? (
            <p className="text-muted-foreground text-xs">
              <Trans i18nKey="kinder:dailyReports.saveBeforeMedia" />
            </p>
          ) : null}
        </div>
      ) : null}

      {attachments.length === 0 ? (
        <PanelEmpty messageKey="kinder:dailyReports.mediaEmpty" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {attachments.map((attachment) => {
            const url = getPublicUrl(attachment.storage_path);
            const posterUrl = attachment.thumbnail_path
              ? getPublicUrl(attachment.thumbnail_path)
              : undefined;

            return (
              <div className="kinder-surface overflow-hidden" key={attachment.id}>
                {attachment.media_type === 'video' ? (
                  <video
                    className="aspect-video w-full bg-black object-contain"
                    controls
                    poster={posterUrl}
                    src={url}
                  />
                ) : (
                  <img
                    alt={attachment.file_name}
                    className="aspect-video w-full object-cover"
                    src={url}
                  />
                )}
                <div className="flex items-center justify-between gap-2 p-2 text-xs">
                  <div className="flex min-w-0 items-center gap-1">
                    {attachment.media_type === 'video' ? (
                      <VideoIcon className="h-3 w-3 shrink-0" />
                    ) : (
                      <ImageIcon className="h-3 w-3 shrink-0" />
                    )}
                    <span className="truncate">{attachment.file_name}</span>
                  </div>
                  {!readOnly ? (
                    <Button
 onClick={async () => {
                        if (!reportId) {
                          return;
                        }

                        const promise = deleteDailyReportAttachmentAction({
                          schoolId,
                          reportId,
                          attachmentId: attachment.id,
                        });

                        toast.promise(promise, {
                          loading: t('schoolSettings.saving'),
                          success: t('dailyReports.mediaDeleted'),
                          error: t('common:genericServerError', { ns: 'common' }),
                        });

                        await promise;
                        router.refresh();
                      }}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
                {attachment.caption ? (
                  <p className="text-muted-foreground px-2 pb-2 text-xs">
                    {attachment.caption}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

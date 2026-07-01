'use client';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { DAILY_REPORT_MEDIA_BUCKET } from '~/lib/kinder/daily-reports/storage';
import type { DailyReportAttachment } from '~/lib/kinder/daily-reports/types';

export function ParentDailyReportMedia({
  attachments,
}: {
  attachments: DailyReportAttachment[];
}) {
  const client = useSupabase();

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {attachments.map((attachment) => {
        const url = client.storage
          .from(DAILY_REPORT_MEDIA_BUCKET)
          .getPublicUrl(attachment.storage_path).data.publicUrl;
        const posterUrl = attachment.thumbnail_path
          ? client.storage
              .from(DAILY_REPORT_MEDIA_BUCKET)
              .getPublicUrl(attachment.thumbnail_path).data.publicUrl
          : undefined;

        return attachment.media_type === 'video' ? (
          <video
            className="aspect-video w-full rounded-md bg-black object-contain"
            controls
            key={attachment.id}
            poster={posterUrl}
            src={url}
          />
        ) : (
          <img
            alt={attachment.file_name}
            className="aspect-video w-full rounded-md object-cover"
            key={attachment.id}
            src={url}
          />
        );
      })}
    </div>
  );
}

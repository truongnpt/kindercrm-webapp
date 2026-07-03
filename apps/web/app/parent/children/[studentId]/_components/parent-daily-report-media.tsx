'use client';

import { useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

import { DAILY_REPORT_MEDIA_BUCKET } from '~/lib/kinder/daily-reports/storage';
import type { DailyReportAttachment } from '~/lib/kinder/daily-reports/types';

export function ParentDailyReportMedia({
  attachments,
}: {
  attachments: DailyReportAttachment[];
}) {
  const client = useSupabase();
  const [activeIndex, setActiveIndex] = useState(0);

  if (attachments.length === 0) {
    return null;
  }

  const active = attachments[activeIndex]!;
  const url = client.storage
    .from(DAILY_REPORT_MEDIA_BUCKET)
    .getPublicUrl(active.storage_path).data.publicUrl;
  const posterUrl = active.thumbnail_path
    ? client.storage
        .from(DAILY_REPORT_MEDIA_BUCKET)
        .getPublicUrl(active.thumbnail_path).data.publicUrl
    : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-2xl bg-black">
        {active.media_type === 'video' ? (
          <video
            className="aspect-[4/3] w-full object-contain"
            controls
            poster={posterUrl}
            src={url}
          />
        ) : (
          <img
            alt={active.file_name}
            className="aspect-[4/3] w-full object-cover"
            src={url}
          />
        )}

        {attachments.length > 1 ? (
          <>
            <Button
 aria-label="Previous"className="absolute top-1/2 left-2 size-10 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
 onClick={() =>
                setActiveIndex(
                  (index) =>
                    (index - 1 + attachments.length) % attachments.length,
                )
              }
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronLeft />
            </Button>
            <Button
 aria-label="Next"className="absolute top-1/2 right-2 size-10 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
 onClick={() =>
                setActiveIndex((index) => (index + 1) % attachments.length)
              }
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronRight />
            </Button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
              {activeIndex + 1} / {attachments.length}
            </div>
          </>
        ) : null}
      </div>

      {attachments.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {attachments.map((attachment, index) => {
            const thumbUrl = client.storage
              .from(DAILY_REPORT_MEDIA_BUCKET)
              .getPublicUrl(
                attachment.thumbnail_path ?? attachment.storage_path,
              ).data.publicUrl;

            return (
              <button
                className={cn(
                  'size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                  index === activeIndex
                    ? 'border-primary'
                    : 'border-transparent opacity-70',
                )}
                key={attachment.id}
                onClick={() => setActiveIndex(index)}
                type="button"
              >
                <img
                  alt={attachment.file_name}
                  className="size-full object-cover"
                  src={thumbUrl}
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

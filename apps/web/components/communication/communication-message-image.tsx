'use client';

import { useState } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { cn } from '@kit/ui/utils';

import { isCommunicationImageMimeType } from '~/lib/kinder/communication/storage';
import { getCommunicationImagePublicUrl } from '~/lib/kinder/communication/upload-communication-image';
import type { CommunicationMessageWithSender } from '~/lib/kinder/communication/types';

export function CommunicationMessageImage({
  message,
  isMine,
}: {
  message: CommunicationMessageWithSender;
  isMine: boolean;
}) {
  const client = useSupabase();
  const [loaded, setLoaded] = useState(false);

  if (
    !message.attachment_storage_path ||
    !isCommunicationImageMimeType(message.attachment_mime_type)
  ) {
    return null;
  }

  const url = getCommunicationImagePublicUrl(
    client,
    message.attachment_storage_path,
  );

  return (
    <a
      className={cn(
        'mt-2 block overflow-hidden rounded-xl border border-border/50',
        isMine ? 'border-primary-foreground/20' : 'bg-muted/30',
      )}
      href={url}
      rel="noreferrer"
      target="_blank"
    >
      <img
        alt={message.attachment_file_name ?? 'Image'}
        className={cn(
          'max-h-72 w-full object-cover transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        src={url}
      />
    </a>
  );
}

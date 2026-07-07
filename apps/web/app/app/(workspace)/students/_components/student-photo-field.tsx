'use client';

import { useEffect, useRef, useState } from 'react';

import { ImagePlus, Loader2, User, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Trans } from '@kit/ui/trans';

import { optimizeStudentPhoto } from '~/lib/kinder/students/optimize-student-photo';
import { ensureStorageQuotaBeforeUpload } from '~/lib/kinder/subscription/ensure-storage-quota-before-upload';
import {
  isStorageLimitError,
  storageLimitMessage,
} from '~/lib/kinder/subscription/storage-quota-messages';
import { uploadStudentPhoto } from '~/lib/kinder/students/upload-student-photo';

function mapPhotoError(error: unknown, t: (key: string) => string) {
  const code = error instanceof Error ? error.message : '';

  if (code === 'UNSUPPORTED_IMAGE_TYPE') {
    return t('students.unsupportedPhoto');
  }

  if (code === 'IMAGE_TOO_LARGE') {
    return t('students.photoTooLarge');
  }

  if (
    code === 'IMAGE_LOAD_FAILED' ||
    code === 'IMAGE_ENCODE_FAILED' ||
    code === 'IMAGE_CANVAS_FAILED'
  ) {
    return t('students.photoProcessFailed');
  }

  if (isStorageLimitError(error)) {
    return storageLimitMessage(t);
  }

  return error instanceof Error ? error.message : t('students.photoUploadFailed');
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`.toUpperCase();
}

export function StudentPhotoField({
  schoolId,
  studentId,
  fullName,
  value,
  onChange,
  onPendingFileChange,
  disabled,
}: {
  schoolId: string;
  studentId?: string;
  fullName: string;
  value?: string | null;
  onChange: (url: string) => void;
  onPendingFileChange?: (file: File | null) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation('kinder');
  const supabase = useSupabase();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayUrl = previewUrl || value || null;
  const deferUpload = !studentId;

  const clearPreview = () => {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
  };

  const handleRemove = () => {
    clearPreview();
    onChange('');
    onPendingFileChange?.(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (file?: File) => {
    if (!file || disabled || uploading) {
      return;
    }

    try {
      setUploading(true);
      const { file: prepared } = await optimizeStudentPhoto(file);

      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      const localPreview = URL.createObjectURL(prepared);
      setPreviewUrl(localPreview);

      if (deferUpload) {
        onPendingFileChange?.(prepared);
        return;
      }

      await ensureStorageQuotaBeforeUpload(schoolId, prepared.size);

      const publicUrl = await uploadStudentPhoto(supabase, {
        schoolId,
        studentId: studentId!,
        file: prepared,
      });

      onChange(publicUrl);
      onPendingFileChange?.(null);
      setPreviewUrl(publicUrl);
    } catch (error) {
      toast.error(mapPhotoError(error, t));
      clearPreview();
      onPendingFileChange?.(null);
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div
        className={cn(
          'relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted',
          displayUrl && 'border-primary/20',
        )}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={fullName || t('students.photo')}
            className="size-full object-cover"
            src={displayUrl}
          />
        ) : (
          <span className="flex flex-col items-center gap-1 text-muted-foreground">
            <User className="size-8 opacity-60" />
            <span className="text-[10px] font-medium uppercase tracking-wide">
              {getInitials(fullName || '?')}
            </span>
          </span>
        )}

        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <input
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled || uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            void handleFileSelect(file);
          }}
          ref={fileInputRef}
          type="file"
        />

        <div className="flex flex-wrap gap-2">
          <Button
 disabled={disabled || uploading}
 onClick={() => fileInputRef.current?.click()}
            size="sm"
            type="button"
            variant="outline"
          >
            <ImagePlus className="mr-2 size-4" />
            <Trans i18nKey="kinder:students.uploadPhoto" />
          </Button>

          {displayUrl ? (
            <Button
 disabled={disabled || uploading}
 onClick={handleRemove}
 size="sm"
 type="button"
 variant="ghost"
 >
              <X className="mr-2 size-4" />
              <Trans i18nKey="kinder:students.removePhoto" />
            </Button>
          ) : null}
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          <Trans i18nKey="kinder:students.photoUploadHint" />
        </p>
      </div>
    </div>
  );
}

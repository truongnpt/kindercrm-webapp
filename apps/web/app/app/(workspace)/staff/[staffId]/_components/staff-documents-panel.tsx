'use client';

import { useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Plus, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  BentoTileHeader,
  KinderFormDialog,
  KinderSubmitButton,
  PanelEmpty,
  useKinderMutation,
} from '~/components/kinder-ui';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import {
  createStaffDocumentAction,
  deleteStaffDocumentAction,
} from '~/lib/kinder/staff/hr-server-actions';
import type { StaffDocument } from '~/lib/kinder/staff/hr-types';
import { CreateStaffDocumentSchema } from '~/lib/kinder/staff/schemas/hr.schema';
import { uploadStaffDocument } from '~/lib/kinder/staff/upload-staff-document';

export function StaffDocumentsPanel({
  documents,
  employeeId,
  schoolId,
  canManage,
}: {
  documents: StaffDocument[];
  employeeId: string;
  schoolId: string;
  canManage: boolean;
}) {
  const router = useRouter();
  const supabase = useSupabase();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    resolver: zodResolver(CreateStaffDocumentSchema),
    defaultValues: {
      schoolId,
      employeeId,
      documentType: 'other' as const,
      title: '',
      fileUrl: '',
      fileName: '',
      expiresAt: '',
      notes: '',
    },
  });

  const createDocument = useKinderMutation({
    mutationFn: createStaffDocumentAction,
    onSuccess: () => {
      form.reset({
        schoolId,
        employeeId,
        documentType: 'other',
        title: '',
        fileUrl: '',
        fileName: '',
        expiresAt: '',
        notes: '',
      });
      setOpen(false);
      router.refresh();
    },
  });

  const deleteDocument = useKinderMutation({
    mutationFn: deleteStaffDocumentAction,
    onSuccess: () => router.refresh(),
  });

  return (
    <BentoTile>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <BentoTileHeader
          description={<Trans i18nKey="kinder:staff.documents.hint" />}
          title={<Trans i18nKey="kinder:staff.documents.title" />}
        />
        {canManage ?
          <Button
            className="shrink-0"
            onClick={() => setOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="mr-1.5 size-4" />
            <Trans i18nKey="kinder:staff.documents.add" />
          </Button>
        : null}
      </div>

      {documents.length > 0 ?
        <ul className="mt-4 flex flex-col gap-2">
          {documents.map((document) => (
            <li
              className="flex flex-col gap-3 rounded-2xl bg-muted/25 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={document.id}
            >
              <div className="flex min-w-0 items-start gap-3">
                <FileText className="text-primary mt-0.5 size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium">{document.title}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    <Trans
                      i18nKey={`kinder:staff.documents.types.${document.document_type}`}
                    />
                    {document.expires_at ? ` · ${document.expires_at}` : ''}
                  </p>
                  {document.file_name ?
                    <a
                      className="text-primary mt-2 inline-block text-sm hover:underline"
                      href={document.file_url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {document.file_name}
                    </a>
                  : null}
                </div>
              </div>
              {canManage ?
                <Button
                  disabled={deleteDocument.isPending}
                  onClick={() =>
                    deleteDocument.mutate({
                      schoolId,
                      documentId: document.id,
                    })
                  }
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              : null}
            </li>
          ))}
        </ul>
      : <div className="mt-4">
          <PanelEmpty messageKey="kinder:staff.documents.empty" />
        </div>
      }

      {canManage ?
        <KinderFormDialog
          onOpenChange={setOpen}
          open={open}
          size="md"
          title={<Trans i18nKey="kinder:staff.documents.add" />}
          footer={
            <KinderSubmitButton
              disabled={uploading}
              loading={createDocument.isPending}
              onClick={form.handleSubmit((data) => createDocument.mutate(data))}
              type="button"
            >
              <Trans i18nKey="kinder:staff.save" />
            </KinderSubmitButton>
          }
        >
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.documents.titleLabel" />
                    </FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.documents.type" />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(
                          [
                            'id_card',
                            'degree',
                            'certificate',
                            'contract',
                            'other',
                          ] as const
                        ).map((type) => (
                          <SelectItem key={type} value={type}>
                            <Trans
                              i18nKey={`kinder:staff.documents.types.${type}`}
                            />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>
                  <Trans i18nKey="kinder:staff.documents.file" />
                </FormLabel>
                <input
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    setUploading(true);

                    try {
                      const uploaded = await uploadStaffDocument(supabase, {
                        schoolId,
                        employeeId,
                        file,
                      });
                      form.setValue('fileUrl', uploaded.fileUrl);
                      form.setValue('fileName', uploaded.fileName);
                      if (!form.getValues('title')) {
                        form.setValue('title', uploaded.fileName);
                      }
                    } finally {
                      setUploading(false);
                    }
                  }}
                  ref={fileRef}
                  type="file"
                />
                <Button
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  type="button"
                  variant="outline"
                >
                  <Upload className="mr-1.5 size-4" />
                  <Trans i18nKey="kinder:staff.documents.chooseFile" />
                </Button>
                {form.watch('fileName') ?
                  <p className="text-muted-foreground mt-2 text-sm">
                    {form.watch('fileName')}
                  </p>
                : null}
              </FormItem>
              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.documents.expiresAt" />
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:staff.notes" />
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </KinderFormDialog>
      : null}
    </BentoTile>
  );
}

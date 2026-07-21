'use client';

import { useRef, useState, useTransition } from 'react';

import { Download, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Trans } from '@kit/ui/trans';

import {
  buildCsv,
  downloadCsv,
  mapCsvRowsByHeader,
  parseCsv,
} from '~/lib/kinder/export/csv';
import { importStudentsAction } from '~/lib/kinder/students/server-actions';
import type { Student } from '~/lib/kinder/students/types';
import { Spinner } from '@kit/ui/spinner';

const STUDENT_CSV_HEADERS = {
  student_code: 'student_code',
  full_name: 'full_name',
  date_of_birth: 'date_of_birth',
  gender: 'gender',
  class_name: 'class_name',
  enrollment_date: 'enrollment_date',
  parent_name: 'parent_name',
  parent_phone: 'parent_phone',
  parent_email: 'parent_email',
  notes: 'notes',
};

export function StudentImportExport({
  schoolId,
  students,
}: {
  schoolId: string;
  students: Student[];
}) {
  const { t } = useTranslation('kinder');
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleExport = () => {
    const csv = buildCsv(
      [
        'student_code',
        'full_name',
        'date_of_birth',
        'gender',
        'class_name',
        'status',
        'enrollment_date',
        'notes',
      ],
      students.map((student) => [
        student.student_code,
        student.full_name,
        student.date_of_birth,
        student.gender,
        student.class_name,
        student.status,
        student.enrollment_date,
        student.notes,
      ]),
    );

    downloadCsv(`students-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const handleDownloadTemplate = () => {
    const csv = buildCsv(
      [
        'student_code',
        'full_name',
        'date_of_birth',
        'gender',
        'class_name',
        'status',
        'enrollment_date',
        'parent_name',
        'parent_phone',
        'parent_email',
        'notes',
      ],
      [],
    );

    downloadCsv(`students-template.csv`, csv);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result ?? '');
      const rows = parseCsv(text);
      const mapped = mapCsvRowsByHeader(rows, STUDENT_CSV_HEADERS);
      console.log(mapped);

      if (mapped.length === 0) {
        toast.error(t('importExport.invalidFile'));
        return;
      }

      startTransition(async () => {
        const result = await importStudentsAction({
          schoolId,
          students: mapped.map((row) => ({
            fullName: row.full_name ?? '',
            studentCode: row.student_code,
            dateOfBirth: row.date_of_birth,
            gender: ['male', 'female', 'other'].includes(row.gender ?? '')
              ? (row.gender as 'male' | 'female' | 'other')
              : undefined,
            className: row.class_name,
            enrollmentDate: row.enrollment_date,
            parentName: row.parent_name,
            parentPhone: row.parent_phone,
            parentEmail: row.parent_email,
            notes: row.notes,
          })),
        });

        if (result.failed > 0) {
          toast.warning(
            t('importExport.partialSuccess', {
              imported: result.imported,
              failed: result.failed,
            }),
          );
        } else {
          toast.success(
            t('importExport.imported', { count: result.imported }),
          );
        }

        setOpen(false);
        router.refresh();
      });
    };

    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleExport} type="button" variant="outline">
        <Download className="mr-2 h-4 w-4" />
        <Trans i18nKey="kinder:importExport.export" />
      </Button>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            <Trans i18nKey="kinder:importExport.import" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Trans i18nKey="kinder:importExport.importStudents" />
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:importExport.studentsHint" />
          </p>
          <input
            accept=".csv,.txt"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                handleImport(file);
              }

              event.target.value = '';
            }}
            ref={fileRef}
            type="file"
          />
          <Button
          disabled={pending}
          onClick={() => fileRef.current?.click()}
            type="button"
          >
            {pending && <Spinner className="mr-2 h-4 w-4" />}
            <Trans i18nKey="kinder:importExport.chooseFile" />
          </Button>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => handleDownloadTemplate()}
          type="button"
          variant="outline"
        >
          <Trans i18nKey="kinder:importExport.template" />
        </Button>
    </div>
  );
}

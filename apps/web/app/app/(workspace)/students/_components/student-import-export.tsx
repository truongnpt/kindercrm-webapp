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

const STUDENT_CSV_HEADERS = {
  'họ tên': 'fullName',
  'ho ten': 'fullName',
  fullname: 'fullName',
  'mã hs': 'studentCode',
  'ma hs': 'studentCode',
  studentcode: 'studentCode',
  'ngày sinh': 'dateOfBirth',
  'ngay sinh': 'dateOfBirth',
  dateofbirth: 'dateOfBirth',
  'giới tính': 'gender',
  'gioi tinh': 'gender',
  gender: 'gender',
  'lớp': 'className',
  lop: 'className',
  classname: 'className',
  'ngày nhập học': 'enrollmentDate',
  'ngay nhap hoc': 'enrollmentDate',
  enrollmentdate: 'enrollmentDate',
  'phụ huynh': 'parentName',
  'phu huynh': 'parentName',
  parentname: 'parentName',
  'sđt ph': 'parentPhone',
  'sdt ph': 'parentPhone',
  parentphone: 'parentPhone',
  'email ph': 'parentEmail',
  parentemail: 'parentEmail',
  'ghi chú': 'notes',
  'ghi chu': 'notes',
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

  const handleImport = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const text = String(reader.result ?? '');
      const rows = parseCsv(text);
      const mapped = mapCsvRowsByHeader(rows, STUDENT_CSV_HEADERS);

      if (mapped.length === 0) {
        toast.error(t('importExport.invalidFile'));
        return;
      }

      startTransition(async () => {
        const result = await importStudentsAction({
          schoolId,
          students: mapped.map((row) => ({
            fullName: row.fullName ?? '',
            studentCode: row.studentCode,
            dateOfBirth: row.dateOfBirth,
            gender: ['male', 'female', 'other'].includes(row.gender ?? '')
              ? (row.gender as 'male' | 'female' | 'other')
              : undefined,
            className: row.className,
            enrollmentDate: row.enrollmentDate,
            parentName: row.parentName,
            parentPhone: row.parentPhone,
            parentEmail: row.parentEmail,
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
      <Button onClick={handleExport} size="sm" type="button" variant="outline">
        <Download className="mr-2 h-4 w-4" />
        <Trans i18nKey="kinder:importExport.export" />
      </Button>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button size="sm" type="button" variant="outline">
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
            <Trans i18nKey="kinder:importExport.chooseFile" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

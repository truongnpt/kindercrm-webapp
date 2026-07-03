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
  mapCsvRowsByHeader,
  parseCsv,
} from '~/lib/kinder/export/csv';
import { downloadStaffExportCsv } from '~/lib/kinder/staff/export-staff';
import { importStaffEmployeesAction } from '~/lib/kinder/staff/hr-server-actions';
import type { StaffEmployeeListItem } from '~/lib/kinder/staff/types';

const STAFF_CSV_HEADERS = {
  'mã nv': 'employeeCode',
  'ma nv': 'employeeCode',
  employeecode: 'employeeCode',
  'họ tên': 'fullName',
  'ho ten': 'fullName',
  fullname: 'fullName',
  email: 'email',
  'sđt': 'phone',
  sdt: 'phone',
  phone: 'phone',
  'phòng ban': 'departmentName',
  'phong ban': 'departmentName',
  department: 'departmentName',
  'chức vụ': 'positionName',
  'chuc vu': 'positionName',
  position: 'positionName',
  'ngày vào': 'hireDate',
  'ngay vao': 'hireDate',
  hiredate: 'hireDate',
  'ngày sinh': 'dateOfBirth',
  'ngay sinh': 'dateOfBirth',
  dateofbirth: 'dateOfBirth',
  'giới tính': 'gender',
  'gioi tinh': 'gender',
  gender: 'gender',
  cccd: 'idNumber',
  'địa chỉ': 'address',
  'dia chi': 'address',
  address: 'address',
  'là giáo viên': 'isTeacher',
  'la giao vien': 'isTeacher',
  isteacher: 'isTeacher',
};

function parseBoolean(value: string) {
  const normalized = value.trim().toLowerCase();

  return ['1', 'yes', 'true', 'có', 'co', 'x'].includes(normalized);
}

export function StaffImportExport({
  schoolId,
  employees,
}: {
  schoolId: string;
  employees: StaffEmployeeListItem[];
}) {
  const { t } = useTranslation('kinder');
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        onClick={() => downloadStaffExportCsv(employees, t)}
        size="sm"
        type="button"
        variant="outline"
      >
        <Download className="mr-1.5 size-4" />
        <Trans i18nKey="kinder:staff.importExport.export" />
      </Button>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger asChild>
          <Button size="sm" type="button" variant="outline">
            <Upload className="mr-1.5 size-4" />
            <Trans i18nKey="kinder:staff.importExport.import" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              <Trans i18nKey="kinder:staff.importExport.importTitle" />
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:staff.importExport.importHint" />
          </p>
          <input
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              startTransition(async () => {
                try {
                  const text = await file.text();
                  const parsed = mapCsvRowsByHeader(parseCsv(text), STAFF_CSV_HEADERS);

                  if (parsed.length === 0) {
                    toast.error(t('staff.importExport.emptyFile'));
                    return;
                  }

                  const result = await importStaffEmployeesAction({
                    schoolId,
                    rows: parsed.map((row) => ({
                      fullName: row.fullName ?? '',
                      employeeCode: row.employeeCode ?? '',
                      email: row.email ?? '',
                      phone: row.phone ?? '',
                      departmentName: row.departmentName ?? '',
                      positionName: row.positionName ?? '',
                      hireDate: row.hireDate ?? '',
                      dateOfBirth: row.dateOfBirth ?? '',
                      gender:
                        row.gender === 'male' ||
                        row.gender === 'female' ||
                        row.gender === 'other' ?
                          row.gender
                        : undefined,
                      idNumber: row.idNumber ?? '',
                      address: row.address ?? '',
                      isTeacher: parseBoolean(row.isTeacher ?? ''),
                    })),
                  });

                  toast.success(
                    t('staff.importExport.imported', {
                      count: result.imported,
                    }),
                  );
                  setOpen(false);
                  router.refresh();
                } catch {
                  toast.error(t('staff.importExport.failed'));
                } finally {
                  if (fileRef.current) {
                    fileRef.current.value = '';
                  }
                }
              });
            }}
            ref={fileRef}
            type="file"
          />
          <Button
            disabled={pending}
            onClick={() => fileRef.current?.click()}
            type="button"
          >
            <Trans i18nKey="kinder:staff.importExport.chooseFile" />
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

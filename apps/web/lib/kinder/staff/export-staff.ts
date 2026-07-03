import type { TFunction } from 'i18next';

import { buildCsv, downloadCsv } from '~/lib/kinder/export/csv';

import type { StaffEmployeeListItem } from './types';

export function buildStaffExportCsv(
  employees: StaffEmployeeListItem[],
  t: TFunction,
) {
  const headers = [
    t('staff.exportColumns.code'),
    t('staff.exportColumns.fullName'),
    t('staff.exportColumns.email'),
    t('staff.exportColumns.phone'),
    t('staff.exportColumns.department'),
    t('staff.exportColumns.position'),
    t('staff.exportColumns.campus'),
    t('staff.exportColumns.status'),
    t('staff.exportColumns.hireDate'),
    t('staff.exportColumns.gender'),
    t('staff.exportColumns.dateOfBirth'),
    t('staff.exportColumns.idNumber'),
    t('staff.exportColumns.address'),
    t('staff.exportColumns.isTeacher'),
    t('staff.exportColumns.notes'),
  ];

  const rows = employees.map((employee) => [
    employee.employee_code,
    employee.full_name,
    employee.email ?? '',
    employee.phone ?? '',
    employee.department?.name ?? '',
    employee.position?.name ?? '',
    employee.campus?.name ?? '',
    t(`staff.statuses.${employee.employment_status}`),
    employee.hire_date ?? '',
    employee.gender ? t(`staff.genders.${employee.gender}`) : '',
    employee.date_of_birth ?? '',
    employee.id_number ?? '',
    employee.address ?? '',
    employee.is_teacher ? t('staff.exportColumns.yes') : t('staff.exportColumns.no'),
    employee.notes ?? '',
  ]);

  return buildCsv(headers, rows);
}

export function downloadStaffExportCsv(
  employees: StaffEmployeeListItem[],
  t: TFunction,
) {
  const csv = buildStaffExportCsv(employees, t);
  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`staff-employees-${date}.csv`, csv);
}

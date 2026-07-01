import type { Database } from '~/lib/database.types';

export type StaffDepartment =
  Database['public']['Tables']['staff_departments']['Row'];

export type StaffPosition =
  Database['public']['Tables']['staff_positions']['Row'];

export type StaffEmployee =
  Database['public']['Tables']['staff_employees']['Row'];

export type StaffContract =
  Database['public']['Tables']['staff_contracts']['Row'];

export type StaffClassAssignment =
  Database['public']['Tables']['staff_class_assignments']['Row'];

export type StaffEmployeeListItem = StaffEmployee & {
  department: Pick<StaffDepartment, 'id' | 'name'> | null;
  position: Pick<StaffPosition, 'id' | 'name'> | null;
  campus: { id: string; name: string } | null;
};

export type StaffEmployeeDetail = StaffEmployeeListItem & {
  account: { id: string; name: string | null; email: string | null } | null;
};

export type StaffHomeroomClass = {
  id: string;
  name: string;
  code: string;
  status: string;
};

import type { Database } from '~/lib/database.types';

export type ParentStudentLink =
  Database['public']['Tables']['parent_student_links']['Row'];

export type ParentChildSummary = {
  linkId: string;
  studentId: string;
  schoolId: string;
  schoolName: string;
  studentCode: string;
  fullName: string;
  className: string | null;
  photoUrl: string | null;
  isPrimary: boolean;
};

export type ParentHomeroomTeacher = {
  name: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
};

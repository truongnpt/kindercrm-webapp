export type ClassStatus = 'active' | 'archived';

export interface SchoolYear {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface Semester {
  id: string;
  school_id: string;
  school_year_id: string;
  name: string;
  start_date: string;
  end_date: string;
  sort_order: number;
}

export interface Classroom {
  id: string;
  school_id: string;
  campus_id: string | null;
  name: string;
  capacity: number;
}

export interface ClassGroup {
  id: string;
  school_id: string;
  campus_id: string | null;
  school_year_id: string;
  semester_id: string | null;
  classroom_id: string | null;
  name: string;
  code: string;
  capacity: number;
  teacher_user_id: string | null;
  status: ClassStatus;
  school_year?: SchoolYear | null;
  semester?: Semester | null;
  classroom?: Classroom | null;
  enrollment_count?: number;
}

export interface ClassEnrollment {
  id: string;
  class_id: string;
  student_id: string;
  school_id: string;
  enrolled_at: string;
  status: string;
  student?: {
    id: string;
    full_name: string;
    student_code: string;
  };
}

export interface ClassSchedule {
  id: string;
  class_id: string;
  school_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  label: string;
}

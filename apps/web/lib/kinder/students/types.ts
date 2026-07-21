import { PaginationParams } from "../types/pagination";

export type StudentStatus =
  | 'active'
  | 'inactive'
  | 'graduated'
  | 'transferred'
  | 'withdrawn';

export type StudentGender = 'male' | 'female' | 'other';

export interface Student {
  id: string;
  school_id: string;
  campus_id: string | null;
  lead_id: string | null;
  student_code: string;
  full_name: string;
  date_of_birth: string | null;
  gender: StudentGender | null;
  photo_url: string | null;
  status: StudentStatus;
  class_name: string | null;
  current_class_id: string | null;
  enrollment_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentParent {
  id: string;
  student_id: string;
  school_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  relationship: string;
  is_primary: boolean;
  address: string | null;
}

export interface StudentEmergencyContact {
  id: string;
  student_id: string;
  school_id: string;
  full_name: string;
  phone: string;
  relationship: string | null;
}

export interface StudentMedicalRecord {
  student_id: string;
  school_id: string;
  blood_type: string | null;
  conditions: string | null;
  medications: string | null;
  doctor_name: string | null;
  doctor_phone: string | null;
  notes: string | null;
}

export interface StudentAllergy {
  id: string;
  student_id: string;
  school_id: string;
  allergen: string;
  severity: string | null;
  notes: string | null;
}

export interface StudentPickupPerson {
  id: string;
  student_id: string;
  school_id: string;
  full_name: string;
  phone: string | null;
  id_number: string | null;
  relationship: string | null;
  photo_url: string | null;
}

export type StudentFilters = PaginationParams & {
  status?: string;
};
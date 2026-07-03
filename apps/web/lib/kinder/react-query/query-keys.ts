/**
 * Centralized React Query keys for Kinder CRM.
 * Use these with invalidateQueries after server-action mutations.
 */
export const kinderQueryKeys = {
  all: ['kinder'] as const,

  school: (schoolId: string) =>
    [...kinderQueryKeys.all, 'school', schoolId] as const,

  dashboard: (schoolId: string) =>
    [...kinderQueryKeys.school(schoolId), 'dashboard'] as const,

  subscription: (schoolId: string) =>
    [...kinderQueryKeys.school(schoolId), 'subscription'] as const,

  crm: {
    all: (schoolId: string) =>
      [...kinderQueryKeys.school(schoolId), 'crm'] as const,
    leads: (schoolId: string) =>
      [...kinderQueryKeys.crm.all(schoolId), 'leads'] as const,
    lead: (schoolId: string, leadId: string) =>
      [...kinderQueryKeys.crm.leads(schoolId), leadId] as const,
  },

  students: {
    all: (schoolId: string) =>
      [...kinderQueryKeys.school(schoolId), 'students'] as const,
    list: (schoolId: string) =>
      [...kinderQueryKeys.students.all(schoolId), 'list'] as const,
    detail: (schoolId: string, studentId: string) =>
      [...kinderQueryKeys.students.all(schoolId), studentId] as const,
  },

  classes: {
    all: (schoolId: string) =>
      [...kinderQueryKeys.school(schoolId), 'classes'] as const,
    detail: (schoolId: string, classId: string) =>
      [...kinderQueryKeys.classes.all(schoolId), classId] as const,
  },

  staff: {
    all: (schoolId: string) =>
      [...kinderQueryKeys.school(schoolId), 'staff'] as const,
    detail: (schoolId: string, staffId: string) =>
      [...kinderQueryKeys.staff.all(schoolId), staffId] as const,
  },

  finance: {
    all: (schoolId: string) =>
      [...kinderQueryKeys.school(schoolId), 'finance'] as const,
    invoices: (schoolId: string) =>
      [...kinderQueryKeys.finance.all(schoolId), 'invoices'] as const,
    invoice: (schoolId: string, invoiceId: string) =>
      [...kinderQueryKeys.finance.invoices(schoolId), invoiceId] as const,
  },

  attendance: (schoolId: string) =>
    [...kinderQueryKeys.school(schoolId), 'attendance'] as const,

  dailyReports: (schoolId: string) =>
    [...kinderQueryKeys.school(schoolId), 'daily-reports'] as const,

  menu: (schoolId: string) =>
    [...kinderQueryKeys.school(schoolId), 'menu'] as const,

  inventory: (schoolId: string) =>
    [...kinderQueryKeys.school(schoolId), 'inventory'] as const,

  health: (schoolId: string) =>
    [...kinderQueryKeys.school(schoolId), 'health'] as const,

  ai: (schoolId: string) =>
    [...kinderQueryKeys.school(schoolId), 'ai'] as const,

  calendar: {
    all: (schoolId: string) =>
      [...kinderQueryKeys.school(schoolId), 'calendar'] as const,
  },

  communication: {
    all: (schoolId: string) =>
      [...kinderQueryKeys.school(schoolId), 'communication'] as const,
    thread: (schoolId: string, threadId: string) =>
      [...kinderQueryKeys.communication.all(schoolId), threadId] as const,
  },

  settings: {
    school: (schoolId: string) =>
      [...kinderQueryKeys.school(schoolId), 'settings', 'school'] as const,
    campuses: (schoolId: string) =>
      [...kinderQueryKeys.school(schoolId), 'settings', 'campuses'] as const,
  },
} as const;

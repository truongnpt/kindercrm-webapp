export function generateStudentCode(schoolId: string, sequence: number) {
  const year = new Date().getFullYear();
  const suffix = String(sequence).padStart(4, '0');
  const schoolPrefix = schoolId.replace(/-/g, '').slice(0, 4).toUpperCase();

  return `HS-${year}-${schoolPrefix}-${suffix}`;
}

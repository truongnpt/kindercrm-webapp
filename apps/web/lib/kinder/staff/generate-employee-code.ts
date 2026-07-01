export function generateEmployeeCode(sequence: number) {
  const year = new Date().getFullYear();

  return `NV-${year}-${String(sequence).padStart(4, '0')}`;
}

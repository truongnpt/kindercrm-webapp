export function formatStudentContractNumber(sequence: number) {
  const year = new Date().getFullYear();

  return `HDHS-${year}-${String(sequence).padStart(4, '0')}`;
}

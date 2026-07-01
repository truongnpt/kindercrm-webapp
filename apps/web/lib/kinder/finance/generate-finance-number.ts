export function formatInvoiceNumber(sequence: number) {
  const year = new Date().getFullYear();

  return `HD-${year}-${String(sequence).padStart(4, '0')}`;
}

export function formatReceiptNumber(sequence: number) {
  const year = new Date().getFullYear();

  return `PT-${year}-${String(sequence).padStart(4, '0')}`;
}

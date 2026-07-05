export function buildTransferContent(invoiceNumber: string) {
  return invoiceNumber.replace(/\s+/g, '').slice(0, 50);
}

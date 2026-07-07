import 'server-only';

const DEFAULT_VAT_RATE = 10;

export function getSaasVatRate() {
  const raw = process.env.SAAS_VAT_RATE;
  const parsed = Number(raw ?? DEFAULT_VAT_RATE);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_VAT_RATE;
}

export function getSaasInvoiceSeller() {
  return {
    name: process.env.SAAS_INVOICE_SELLER_NAME?.trim() || 'Kinder CRM',
    taxCode: process.env.SAAS_INVOICE_SELLER_TAX_CODE?.trim() || '',
    address: process.env.SAAS_INVOICE_SELLER_ADDRESS?.trim() || '',
    email: process.env.SAAS_INVOICE_SELLER_EMAIL?.trim() || '',
  };
}

export function splitVatFromTotal(totalAmount: number, vatRate: number) {
  if (totalAmount <= 0 || vatRate <= 0) {
    return { subtotal: totalAmount, vatAmount: 0 };
  }

  const subtotal = Math.round(totalAmount / (1 + vatRate / 100));
  const vatAmount = totalAmount - subtotal;

  return { subtotal, vatAmount };
}

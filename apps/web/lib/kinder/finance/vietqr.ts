export type VietQrConfig = {
  bankBin: string;
  accountNo: string;
  accountName: string;
};

export function getVietQrConfig(): VietQrConfig | null {
  const bankBin = process.env.NEXT_PUBLIC_VIETQR_BANK_BIN?.trim();
  const accountNo = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO?.trim();
  const accountName = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME?.trim();

  if (!bankBin || !accountNo || !accountName) {
    return null;
  }

  return { bankBin, accountNo, accountName };
}

export function buildVietQrImageUrl(input: {
  config: VietQrConfig;
  amount?: number;
  description?: string;
}) {
  const base = `https://img.vietqr.io/image/${input.config.bankBin}-${input.config.accountNo}-compact2.png`;
  const params = new URLSearchParams();

  if (input.amount && input.amount > 0) {
    params.set('amount', String(Math.round(input.amount)));
  }

  if (input.description) {
    params.set('addInfo', input.description.slice(0, 100));
  }

  if (input.config.accountName) {
    params.set('accountName', input.config.accountName);
  }

  const query = params.toString();

  return query ? `${base}?${query}` : base;
}

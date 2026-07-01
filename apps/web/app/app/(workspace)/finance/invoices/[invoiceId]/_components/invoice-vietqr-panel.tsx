'use client';

import Image from 'next/image';

import { Trans } from '@kit/ui/trans';

import { formatVnd } from '~/lib/kinder/billing/format-currency';
import {
  buildVietQrImageUrl,
  type VietQrConfig,
} from '~/lib/kinder/finance/vietqr';

export function InvoiceVietQrPanel({
  config,
  amount,
  invoiceNumber,
  studentName,
}: {
  config: VietQrConfig;
  amount: number;
  invoiceNumber: string;
  studentName: string;
}) {
  const qrUrl = buildVietQrImageUrl({
    config,
    amount,
    description: `${invoiceNumber} ${studentName}`.slice(0, 100),
  });

  return (
    <div className="kinder-mobile-card">
      <p className="font-medium">
        <Trans i18nKey="kinder:finance.qr.title" />
      </p>
      <p className="text-muted-foreground mt-1 text-sm">
        <Trans
          i18nKey="kinder:finance.qr.amount"
          values={{ amount: formatVnd(amount) }}
        />
      </p>
      <div className="mt-4 flex justify-center">
        <Image
          alt="VietQR"
          className="rounded-md border"
          height={220}
          src={qrUrl}
          unoptimized
          width={220}
        />
      </div>
      <p className="text-muted-foreground mt-3 text-center text-xs">
        {config.accountName} · {config.accountNo}
      </p>
    </div>
  );
}

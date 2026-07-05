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
  transferContent,
  qrUrl,
}: {
  config: VietQrConfig | null;
  amount: number;
  invoiceNumber: string;
  studentName: string;
  transferContent?: string | null;
  qrUrl?: string | null;
}) {
  const resolvedQrUrl =
    qrUrl ??
    (config ?
      buildVietQrImageUrl({
        config,
        amount,
        description: transferContent ?? `${invoiceNumber} ${studentName}`.slice(0, 100),
      })
    : null);

  if (!resolvedQrUrl) {
    return null;
  }

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
      {transferContent ? (
        <p className="mt-2 rounded-md bg-muted px-3 py-2 font-mono text-xs">
          <Trans i18nKey="kinder:finance.qr.transferContent" />: {transferContent}
        </p>
      ) : null}
      <div className="mt-4 flex justify-center">
        <Image
          alt="VietQR"
          className="rounded-md border"
          height={220}
          src={resolvedQrUrl}
          unoptimized
          width={220}
        />
      </div>
      {config ? (
        <p className="text-muted-foreground mt-3 text-center text-xs">
          {config.accountName} · {config.accountNo}
        </p>
      ) : null}
    </div>
  );
}

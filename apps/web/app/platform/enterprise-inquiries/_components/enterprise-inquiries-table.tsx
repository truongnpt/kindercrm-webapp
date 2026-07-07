import Link from 'next/link';

import { Mail } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import { PlatformDataTable, PlatformEmptyState } from '~/components/platform-console';
import pathsConfig from '~/config/paths.config';
import type { EnterpriseInquiryListItem } from '~/lib/kinder/platform/types';

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  new: 'default',
  contacted: 'secondary',
  closed: 'outline',
};

export function EnterpriseInquiriesTable({
  inquiries,
}: {
  inquiries: EnterpriseInquiryListItem[];
}) {
  if (inquiries.length === 0) {
    return (
      <PlatformEmptyState
        icon={Mail}
        titleKey="kinder:platform.enterpriseInquiries.empty"
      />
    );
  }

  return (
    <PlatformDataTable>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>
              <Trans i18nKey="kinder:platform.enterpriseInquiries.time" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.enterpriseInquiries.school" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.enterpriseInquiries.contact" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.enterpriseInquiries.campuses" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.enterpriseInquiries.status" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.enterpriseInquiries.notes" />
            </th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id}>
              <td className="text-muted-foreground whitespace-nowrap text-xs">
                {new Date(inquiry.created_at).toLocaleString('vi-VN')}
              </td>
              <td>
                <Link
                  className="font-medium hover:underline"
                  href={`${pathsConfig.platform.schoolDetail}/${inquiry.school_id}`}
                >
                  {inquiry.school_name}
                </Link>
                <p className="text-muted-foreground font-mono text-xs">
                  {inquiry.school_slug}
                </p>
              </td>
              <td>
                <p className="font-medium">{inquiry.contact_name}</p>
                <p className="text-muted-foreground text-xs">{inquiry.phone}</p>
                {inquiry.submitter_email ? (
                  <p className="text-muted-foreground text-xs">
                    {inquiry.submitter_name ?? inquiry.submitter_email}
                  </p>
                ) : null}
              </td>
              <td>{inquiry.campus_count}</td>
              <td>
                <Badge variant={STATUS_VARIANT[inquiry.status] ?? 'outline'}>
                  <Trans
                    i18nKey={`kinder:platform.enterpriseInquiries.statuses.${inquiry.status}`}
                  />
                </Badge>
              </td>
              <td className="text-muted-foreground max-w-[240px] truncate text-xs">
                {inquiry.notes ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PlatformDataTable>
  );
}

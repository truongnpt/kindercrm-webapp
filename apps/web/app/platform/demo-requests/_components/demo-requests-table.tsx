'use client';

import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { useKinderMutation } from '~/components/kinder-ui';
import { PlatformDataTable, PlatformEmptyState } from '~/components/platform-console';
import { platformReviewDemoRequestAction } from '~/lib/kinder/platform/demo-request-actions';
import type { DemoRequestListItem } from '~/lib/kinder/platform/types';

const STATUS_VARIANT: Record<
  DemoRequestListItem['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  pending: 'default',
  approved: 'secondary',
  rejected: 'destructive',
};

export function DemoRequestsTable({
  requests,
}: {
  requests: DemoRequestListItem[];
}) {
  if (requests.length === 0) {
    return (
      <PlatformEmptyState
        icon={Mail}
        titleKey="kinder:platform.demoRequests.empty"
      />
    );
  }

  return (
    <PlatformDataTable>
      <table className="w-full min-w-[980px] text-sm">
        <thead>
          <tr>
            <th>
              <Trans i18nKey="kinder:platform.demoRequests.time" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.demoRequests.school" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.demoRequests.contact" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.demoRequests.message" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.demoRequests.status" />
            </th>
            <th>
              <Trans i18nKey="kinder:platform.demoRequests.actions" />
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <DemoRequestRow key={request.id} request={request} />
          ))}
        </tbody>
      </table>
    </PlatformDataTable>
  );
}

function DemoRequestRow({ request }: { request: DemoRequestListItem }) {
  const { t } = useTranslation('kinder');

  const reviewRequest = useKinderMutation({
    mutationFn: platformReviewDemoRequestAction,
    onSuccess: () => {
      toast.success(t('platform.demoRequests.updated'));
    },
    onError: () => {
      toast.error(t('platform.demoRequests.updateError'));
    },
  });

  const isPending = request.status === 'pending';

  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="text-muted-foreground whitespace-nowrap px-3 py-3 text-xs">
        {new Date(request.created_at).toLocaleString('vi-VN')}
      </td>
      <td className="px-3 py-3 font-medium">{request.school_name}</td>
      <td className="px-3 py-3">
        <p className="font-medium">{request.email}</p>
        <p className="text-muted-foreground text-xs">{request.phone}</p>
      </td>
      <td className="text-muted-foreground max-w-[340px] px-3 py-3 text-xs whitespace-pre-wrap">
        {request.message}
      </td>
      <td className="px-3 py-3">
        <Badge variant={STATUS_VARIANT[request.status]}>
          <Trans
            i18nKey={`kinder:platform.demoRequests.statuses.${request.status}`}
          />
        </Badge>
      </td>
      <td className="px-3 py-3 text-right">
        {isPending ? (
          <div className="flex justify-end gap-2">
            <Button
              disabled={reviewRequest.isPending}
              onClick={() =>
                reviewRequest.mutate({
                  requestId: request.id,
                  decision: 'approved',
                })
              }
              size="sm"
              type="button"
              variant="default"
            >
              <Trans i18nKey="kinder:platform.demoRequests.approve" />
            </Button>
            <Button
              disabled={reviewRequest.isPending}
              onClick={() =>
                reviewRequest.mutate({
                  requestId: request.id,
                  decision: 'rejected',
                })
              }
              size="sm"
              type="button"
              variant="outline"
            >
              <Trans i18nKey="kinder:platform.demoRequests.reject" />
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">
            <Trans i18nKey="kinder:platform.demoRequests.reviewed" />
          </span>
        )}
      </td>
    </tr>
  );
}

'use client';

import { AlertCircle, Mail } from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { BentoTile, BentoTileHeader } from '~/components/kinder-ui';
import type { StaffModulePermissions } from '~/lib/kinder/permissions';
import {
  canResendStaffInvite,
  getStaffInviteAccessState,
  type StaffInviteAccessState,
} from '~/lib/kinder/staff/staff-invite-state';
import type { StaffEmployeeDetail } from '~/lib/kinder/staff/types';

import { StaffResendInviteButton } from './staff-resend-invite-button';

const HINT_KEYS: Record<
  Exclude<StaffInviteAccessState, 'activated' | null>,
  string
> = {
  failed: 'kinder:staff.inviteFailedHint',
  pending: 'kinder:staff.invitePendingHint',
  no_email: 'kinder:staff.inviteNoEmailHint',
};

export function StaffAccessInvitePanel({
  employee,
  schoolId,
  permissions,
}: {
  employee: StaffEmployeeDetail;
  schoolId: string;
  permissions: StaffModulePermissions;
}) {
  const state = getStaffInviteAccessState(employee);

  if (!state || state === 'activated') {
    return null;
  }

  const showResend =
    permissions.canManageAccess && canResendStaffInvite(employee);

  return (
    <BentoTile className="border-amber-500/30 bg-amber-500/5" colSpan={2}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <BentoTileHeader
            className="mb-2"
            title={
              <span className="inline-flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="size-4 shrink-0" />
                <Trans i18nKey="kinder:staff.inviteActionTitle" />
              </span>
            }
          />
          <p className="text-muted-foreground text-sm leading-relaxed">
            <Trans i18nKey={HINT_KEYS[state]} />
          </p>
          {employee.invite_sent_at ? (
            <p className="text-muted-foreground mt-2 text-xs">
              <Trans
                i18nKey="kinder:staff.inviteLastSent"
                values={{
                  date: new Date(employee.invite_sent_at).toLocaleString(),
                }}
              />
            </p>
          ) : null}
        </div>

        {showResend ? (
          <StaffResendInviteButton
            className="shrink-0 rounded-full"
            employeeId={employee.id}
            schoolId={schoolId}
          />
        ) : (
          <span className="text-muted-foreground inline-flex items-center gap-2 text-sm">
            <Mail className="size-4" />
            <Trans i18nKey="kinder:staff.inviteContactAdmin" />
          </span>
        )}
      </div>
    </BentoTile>
  );
}

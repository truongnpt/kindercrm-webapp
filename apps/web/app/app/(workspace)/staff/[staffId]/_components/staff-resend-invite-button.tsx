'use client';

import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { toast } from '@kit/ui/sonner';
import { Trans } from '@kit/ui/trans';

import { kinderQueryKeys, useKinderMutation } from '~/components/kinder-ui';
import { resendStaffInviteAction } from '~/lib/kinder/staff/server-actions';

export function StaffResendInviteButton({
  employeeId,
  schoolId,
  className,
  size = 'sm',
  variant = 'outline',
}: {
  employeeId: string;
  schoolId: string;
  className?: string;
  size?: 'sm' | 'default';
  variant?: 'outline' | 'default' | 'secondary';
}) {
  const { t } = useTranslation('kinder');

  const resendInvite = useKinderMutation({
    mutationFn: resendStaffInviteAction,
    invalidateKeys: [
      kinderQueryKeys.staff.all(schoolId),
      kinderQueryKeys.staff.detail(schoolId, employeeId),
    ],
    onSuccess: () => {
      toast.success(t('staff.inviteSent'));
    },
    onError: (error) => {
      toast.error(error.message || t('staff.inviteResendFailed'));
    },
  });

  return (
    <Button
      className={className}
      disabled={resendInvite.isPending}
      onClick={() => resendInvite.mutate({ employeeId, schoolId })}
      size={size}
      type="button"
      variant={variant}
    >
      <Mail className="mr-2 size-4" />
      <Trans i18nKey="kinder:staff.resendInvite" />
    </Button>
  );
}

import type { StaffEmployee } from './types';

export type StaffInviteAccessState =
  | 'activated'
  | 'pending'
  | 'failed'
  | 'no_email';

export function getStaffInviteAccessState(
  employee: Pick<
    StaffEmployee,
    | 'grant_system_access'
    | 'email'
    | 'user_id'
    | 'invite_sent_at'
    | 'invite_accepted_at'
  >,
): StaffInviteAccessState | null {
  if (!employee.grant_system_access) {
    return null;
  }

  if (!employee.email) {
    return 'no_email';
  }

  if (employee.invite_accepted_at) {
    return 'activated';
  }

  if (!employee.user_id && !employee.invite_sent_at) {
    return 'failed';
  }

  if (employee.user_id || employee.invite_sent_at) {
    return 'pending';
  }

  return 'failed';
}

export function canResendStaffInvite(
  employee: Pick<
    StaffEmployee,
    | 'grant_system_access'
    | 'email'
    | 'invite_accepted_at'
  >,
) {
  return Boolean(
    employee.grant_system_access &&
      employee.email &&
      !employee.invite_accepted_at,
  );
}

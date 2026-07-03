import { Badge } from '@kit/ui/badge';
import { Trans } from '@kit/ui/trans';

import { BentoGrid, BentoTile, BentoTileHeader } from '~/components/kinder-ui';
import { formatVnd } from '~/lib/kinder/billing/format-currency';
import type { StaffModulePermissions } from '~/lib/kinder/permissions';
import type {
  StaffContract,
  StaffEmployeeDetail,
} from '~/lib/kinder/staff/types';

import { StaffAvatar } from '../../_components/staff-avatar';
import { StaffStatusBadge } from '../../_components/staff-status-badge';
import { StaffAccessInvitePanel } from './staff-access-invite-panel';

function InfoRow({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 border-border/25 border-b py-3 last:border-0">
      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground text-sm font-medium">{value}</dd>
    </div>
  );
}

export function StaffProfileBento({
  employee,
  activeContract,
  schoolId,
  permissions,
}: {
  employee: StaffEmployeeDetail;
  activeContract?: StaffContract;
  schoolId: string;
  permissions: StaffModulePermissions;
}) {
  return (
    <BentoGrid>
      <StaffAccessInvitePanel
        employee={employee}
        permissions={permissions}
        schoolId={schoolId}
      />

      <BentoTile colSpan={2}>
        <div className="flex items-start gap-4">
          <StaffAvatar name={employee.full_name} size="lg" />
          <div className="min-w-0 flex-1">
            <BentoTileHeader
              description={employee.employee_code}
              title={employee.full_name}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <StaffStatusBadge status={employee.employment_status} />
              {employee.is_teacher ? (
                <Badge>
                  <Trans i18nKey="kinder:staff.teacherBadge" />
                </Badge>
              ) : null}
              {employee.user_id ? (
                <Badge variant="outline">
                  <Trans i18nKey="kinder:staff.accountLinked" />
                </Badge>
              ) : employee.grant_system_access ? (
                <Badge variant="outline">
                  <Trans i18nKey="kinder:staff.accountPending" />
                </Badge>
              ) : null}
              {employee.user_id &&
              employee.invite_sent_at &&
              !employee.invite_accepted_at ? (
                <Badge variant="secondary">
                  <Trans i18nKey="kinder:staff.invitePending" />
                </Badge>
              ) : null}
              {employee.invite_accepted_at ? (
                <Badge variant="outline">
                  <Trans i18nKey="kinder:staff.inviteAccepted" />
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </BentoTile>

      <BentoTile colSpan={2}>
        <BentoTileHeader title={<Trans i18nKey="kinder:staff.personalInfo" />} />
        <dl>
          <InfoRow
            label={<Trans i18nKey="kinder:staff.dateOfBirth" />}
            value={employee.date_of_birth ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.gender" />}
            value={
              employee.gender ?
                <Trans i18nKey={`kinder:staff.genders.${employee.gender}`} />
              : '—'
            }
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.idNumber" />}
            value={employee.id_number ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.address" />}
            value={employee.address ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.emergencyContactName" />}
            value={employee.emergency_contact_name ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.emergencyContactPhone" />}
            value={employee.emergency_contact_phone ?? '—'}
          />
        </dl>
      </BentoTile>

      <BentoTile colSpan={2}>
        <BentoTileHeader title={<Trans i18nKey="kinder:staff.contact" />} />
        <dl>
          <InfoRow
            label={<Trans i18nKey="kinder:staff.email" />}
            value={employee.email ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.phone" />}
            value={employee.phone ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.campus" />}
            value={employee.campus?.name ?? '—'}
          />
        </dl>
      </BentoTile>

      <BentoTile colSpan={2}>
        <BentoTileHeader title={<Trans i18nKey="kinder:staff.organization" />} />
        <dl>
          <InfoRow
            label={<Trans i18nKey="kinder:staff.department" />}
            value={employee.department?.name ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.position" />}
            value={employee.position?.name ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.accessRole" />}
            value={
              employee.custom_role?.name ?? (
                <Trans
                  i18nKey={`kinder:staff.accessRoles.${employee.access_role}`}
                />
              )
            }
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.manager" />}
            value={employee.manager?.full_name ?? '—'}
          />
          <InfoRow
            label={<Trans i18nKey="kinder:staff.hireDate" />}
            value={employee.hire_date ?? '—'}
          />
          {employee.termination_date ?
            <InfoRow
              label={<Trans i18nKey="kinder:staff.terminationDate" />}
              value={employee.termination_date}
            />
          : null}
        </dl>
      </BentoTile>

      <BentoTile colSpan={2}>
        <BentoTileHeader title={<Trans i18nKey="kinder:staff.notes" />} />
        <p className="text-muted-foreground text-sm leading-relaxed">
          {employee.notes ?? '—'}
        </p>
        {activeContract ? (
          <p className="text-muted-foreground mt-4 text-sm">
            <Trans i18nKey="kinder:staff.activeContract" />:{' '}
            <span className="text-foreground font-medium">
              {formatVnd(activeContract.salary_amount)}
            </span>
          </p>
        ) : null}
      </BentoTile>
    </BentoGrid>
  );
}

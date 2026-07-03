import { Trans } from '@kit/ui/trans';

import { BentoGrid, BentoTile, BentoTileHeader, StatCard } from '~/components/kinder-ui';
import type { StaffHrReportSummary } from '~/lib/kinder/staff/hr-types';

export function StaffReportsWorkspace({
  summary,
}: {
  summary: StaffHrReportSummary;
}) {
  return (
    <div className="flex flex-col gap-4">
      <BentoGrid className="mb-0" columns={4}>
        <StatCard
          labelKey="kinder:staff.stats.total"
          tone="default"
          value={String(summary.totalEmployees)}
        />
        <StatCard
          labelKey="kinder:staff.stats.active"
          tone="success"
          value={String(summary.activeEmployees)}
        />
        <StatCard
          labelKey="kinder:staff.reports.leavePending"
          tone="warning"
          value={String(summary.leavePending)}
        />
        <StatCard
          labelKey="kinder:staff.reports.contractsExpiring"
          tone="info"
          value={String(summary.contractsExpiringSoon)}
        />
      </BentoGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <BentoTile>
          <BentoTileHeader
            description={<Trans i18nKey="kinder:staff.reports.attendanceHint" />}
            title={<Trans i18nKey="kinder:staff.reports.attendanceTitle" />}
          />
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-muted/25 p-4">
              <dt className="text-muted-foreground text-xs uppercase">
                <Trans i18nKey="kinder:staff.reports.checkedIn" />
              </dt>
              <dd className="mt-2 text-2xl font-semibold">
                {summary.attendanceToday.checkedIn}
              </dd>
            </div>
            <div className="rounded-2xl bg-muted/25 p-4">
              <dt className="text-muted-foreground text-xs uppercase">
                <Trans i18nKey="kinder:staff.reports.late" />
              </dt>
              <dd className="mt-2 text-2xl font-semibold">
                {summary.attendanceToday.late}
              </dd>
            </div>
            <div className="rounded-2xl bg-muted/25 p-4">
              <dt className="text-muted-foreground text-xs uppercase">
                <Trans i18nKey="kinder:staff.reports.absent" />
              </dt>
              <dd className="mt-2 text-2xl font-semibold">
                {summary.attendanceToday.absent}
              </dd>
            </div>
          </dl>
        </BentoTile>

        <BentoTile>
          <BentoTileHeader
            description={<Trans i18nKey="kinder:staff.reports.departmentHint" />}
            title={<Trans i18nKey="kinder:staff.reports.departmentTitle" />}
          />
          {summary.byDepartment.length > 0 ?
            <ul className="mt-4 flex flex-col gap-2">
              {summary.byDepartment.map((item) => (
                <li
                  className="flex items-center justify-between rounded-2xl bg-muted/25 px-4 py-3 text-sm"
                  key={item.name}
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </li>
              ))}
            </ul>
          : <p className="text-muted-foreground mt-4 text-sm">
              <Trans i18nKey="kinder:staff.reports.noDepartments" />
            </p>
          }
        </BentoTile>
      </div>
    </div>
  );
}

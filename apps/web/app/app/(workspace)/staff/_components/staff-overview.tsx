import { Briefcase, GraduationCap, UserCheck, Users } from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';
import type { StaffEmployeeListItem } from '~/lib/kinder/staff/types';

export function StaffOverview({
  employees,
}: {
  employees: StaffEmployeeListItem[];
}) {
  const total = employees.length;
  const active = employees.filter(
    (employee) => employee.employment_status === 'active',
  ).length;
  const teachers = employees.filter((employee) => employee.is_teacher).length;
  const onLeave = employees.filter(
    (employee) => employee.employment_status === 'on_leave',
  ).length;

  return (
    <BentoGrid className="mb-2" columns={4}>
      <StatCard
        icon={Users}
        labelKey="kinder:staff.stats.total"
        tone="default"
        value={String(total)}
      />
      <StatCard
        icon={UserCheck}
        labelKey="kinder:staff.stats.active"
        tone="success"
        value={String(active)}
      />
      <StatCard
        icon={GraduationCap}
        labelKey="kinder:staff.stats.teachers"
        tone="info"
        value={String(teachers)}
      />
      <StatCard
        icon={Briefcase}
        labelKey="kinder:staff.stats.onLeave"
        tone="warning"
        value={String(onLeave)}
      />
    </BentoGrid>
  );
}

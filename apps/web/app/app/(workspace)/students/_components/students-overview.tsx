import {
  GraduationCap,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';
import type { Student } from '~/lib/kinder/students/types';

export function StudentsOverview({ students }: { students: Student[] }) {
  const total = students.length;
  const active = students.filter((s) => s.status === 'active').length;
  const graduated = students.filter((s) => s.status === 'graduated').length;
  const inactive = students.filter((s) =>
    ['inactive', 'transferred', 'withdrawn'].includes(s.status),
  ).length;

  return (
    <BentoGrid className="mb-2" columns={4}>
      <StatCard
        icon={Users}
        labelKey="kinder:students.stats.total"
        tone="default"
        value={String(total)}
      />
      <StatCard
        icon={UserCheck}
        labelKey="kinder:students.stats.active"
        tone="success"
        value={String(active)}
      />
      <StatCard
        icon={GraduationCap}
        labelKey="kinder:students.stats.graduated"
        tone="info"
        value={String(graduated)}
      />
      <StatCard
        icon={UserMinus}
        labelKey="kinder:students.stats.inactive"
        tone="warning"
        value={String(inactive)}
      />
    </BentoGrid>
  );
}

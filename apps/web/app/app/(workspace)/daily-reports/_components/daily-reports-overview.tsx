import { BookOpen, CheckCircle2, FilePen, Users } from 'lucide-react';

import { BentoGrid, StatCard } from '~/components/kinder-ui';
import type { DailyReportsDaySummary } from '~/lib/kinder/daily-reports/types';

export function DailyReportsOverview({
  summary,
}: {
  summary: DailyReportsDaySummary;
}) {
  return (
    <BentoGrid className="mb-2" columns={4}>
      <StatCard
        icon={Users}
        labelKey="kinder:dailyReports.stats.enrolled"
        tone="default"
        value={String(summary.totalStudents)}
      />
      <StatCard
        icon={CheckCircle2}
        labelKey="kinder:dailyReports.stats.published"
        tone="success"
        trend={`${summary.completionRate}%`}
        trendDirection={summary.completionRate >= 80 ? 'up' : 'down'}
        trendLabelKey="kinder:dailyReports.stats.completionLabel"
        value={String(summary.publishedCount)}
      />
      <StatCard
        icon={FilePen}
        labelKey="kinder:dailyReports.stats.draft"
        tone="info"
        value={String(summary.draftCount)}
      />
      <StatCard
        icon={BookOpen}
        labelKey="kinder:dailyReports.stats.missing"
        tone="warning"
        value={String(summary.missingCount)}
      />
    </BentoGrid>
  );
}

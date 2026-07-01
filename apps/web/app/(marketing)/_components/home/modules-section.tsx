'use client';

import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  HeartPulse,
  LayoutDashboard,
  Package,
  Smartphone,
  Target,
  Utensils,
  Users,
  Wallet,
} from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  MarketingSection,
  SectionHeader,
  Stagger,
  StaggerItem,
} from '~/components/marketing';

const modules = [
  { icon: Target, labelKey: 'marketing:heroFeatureCrm', descKey: 'marketing:heroFeatureCrmDesc' },
  { icon: GraduationCap, labelKey: 'marketing:heroFeatureStudents', descKey: 'marketing:heroFeatureStudentsDesc' },
  { icon: ClipboardCheck, labelKey: 'marketing:heroFeatureAttendance', descKey: 'marketing:heroFeatureAttendanceDesc' },
  { icon: Wallet, labelKey: 'marketing:heroFeatureFees', descKey: 'marketing:heroFeatureFeesDesc' },
  { icon: BookOpen, labelKey: 'marketing:heroFeatureDiary', descKey: 'marketing:heroFeatureDiaryDesc' },
  { icon: HeartPulse, labelKey: 'marketing:moduleHealth', descKey: 'marketing:moduleHealthDesc' },
  { icon: Utensils, labelKey: 'marketing:heroFeatureMenu', descKey: 'marketing:heroFeatureMenuDesc' },
  { icon: Package, labelKey: 'marketing:moduleInventory', descKey: 'marketing:moduleInventoryDesc' },
  { icon: BarChart3, labelKey: 'marketing:heroFeatureReports', descKey: 'marketing:heroFeatureReportsDesc' },
  { icon: Smartphone, labelKey: 'marketing:moduleParentApp', descKey: 'marketing:moduleParentAppDesc' },
  { icon: Users, labelKey: 'marketing:moduleTeacherApp', descKey: 'marketing:moduleTeacherAppDesc' },
  { icon: LayoutDashboard, labelKey: 'marketing:moduleDashboard', descKey: 'marketing:moduleDashboardDesc' },
] as const;

export function ModulesSection() {
  return (
    <MarketingSection id="features" alt>
      <SectionHeader
        eyebrow={<Trans i18nKey="marketing:heroFeatureAllInOne" />}
        title={<Trans i18nKey="marketing:heroFeatureHeading" />}
        subtitle={
          <Trans
            i18nKey="marketing:heroFeatureSubheading"
            values={{ productName: 'Kinder CRM' }}
          />
        }
        className="mb-14"
      />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map(({ icon: Icon, labelKey, descKey }) => (
          <StaggerItem key={labelKey}>
            <article className="marketing-card group h-full rounded-2xl p-5">
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[var(--marketing-primary)]/10 text-[var(--marketing-primary)] transition-colors group-hover:bg-[var(--marketing-primary)] group-hover:text-white">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold text-[var(--marketing-text)]">
                <Trans i18nKey={labelKey} />
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--marketing-text-muted)]">
                <Trans i18nKey={descKey} />
              </p>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </MarketingSection>
  );
}

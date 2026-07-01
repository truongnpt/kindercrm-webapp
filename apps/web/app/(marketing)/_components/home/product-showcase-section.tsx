'use client';

import { useState } from 'react';

import {
  BarChart3,
  ClipboardCheck,
  MessageCircle,
  Users,
  Wallet,
} from 'lucide-react';

import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import {
  FadeIn,
  MarketingSection,
  SectionHeader,
} from '~/components/marketing';

const tabs = [
  {
    id: 'dashboard',
    labelKey: 'marketing:showcaseTabDashboard',
    icon: BarChart3,
    titleKey: 'marketing:showcaseDashboardTitle',
    descKey: 'marketing:showcaseDashboardDesc',
  },
  {
    id: 'attendance',
    labelKey: 'marketing:showcaseTabAttendance',
    icon: ClipboardCheck,
    titleKey: 'marketing:showcaseAttendanceTitle',
    descKey: 'marketing:showcaseAttendanceDesc',
  },
  {
    id: 'finance',
    labelKey: 'marketing:showcaseTabFinance',
    icon: Wallet,
    titleKey: 'marketing:showcaseFinanceTitle',
    descKey: 'marketing:showcaseFinanceDesc',
  },
  {
    id: 'parents',
    labelKey: 'marketing:showcaseTabParents',
    icon: MessageCircle,
    titleKey: 'marketing:showcaseParentsTitle',
    descKey: 'marketing:showcaseParentsDesc',
  },
  {
    id: 'staff',
    labelKey: 'marketing:showcaseTabStaff',
    icon: Users,
    titleKey: 'marketing:showcaseStaffTitle',
    descKey: 'marketing:showcaseStaffDesc',
  },
] as const;

type TabId = (typeof tabs)[number]['id'];

function ShowcasePanel({ active }: { active: TabId }) {
  const panels: Record<TabId, React.ReactNode> = {
    dashboard: (
      <div className="grid gap-3 sm:grid-cols-3">
        {['Revenue', 'Enrollment', 'Attendance'].map((label, i) => (
          <div key={label} className="rounded-xl bg-[var(--marketing-section)] p-4">
            <p className="text-xs text-[var(--marketing-text-muted)]">{label}</p>
            <p className="mt-1 text-2xl font-bold text-[var(--marketing-text)]">
              {['₫248M', '128', '96%'][i]}
            </p>
          </div>
        ))}
        <div className="col-span-full flex h-40 items-end gap-2 rounded-xl bg-[var(--marketing-section)] p-4">
          {[35, 55, 40, 70, 50, 85, 65, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-[var(--marketing-primary)]"
              style={{ height: `${h}%`, opacity: 0.4 + i * 0.07 }}
            />
          ))}
        </div>
      </div>
    ),
    attendance: (
      <ul className="space-y-2">
        {['Sunflower Class', 'Rainbow Class', 'Star Class'].map((cls, i) => (
          <li
            key={cls}
            className="flex items-center justify-between rounded-xl bg-[var(--marketing-section)] px-4 py-3 text-sm"
          >
            <span>{cls}</span>
            <span className="font-medium text-[var(--marketing-secondary)]">
              {[28, 24, 22][i]}/30 present
            </span>
          </li>
        ))}
      </ul>
    ),
    finance: (
      <div className="space-y-3">
        <div className="flex justify-between rounded-xl bg-[var(--marketing-section)] p-4">
          <span className="text-sm text-[var(--marketing-text-muted)]">Collected</span>
          <span className="font-semibold text-[var(--marketing-secondary)]">₫186M</span>
        </div>
        <div className="flex justify-between rounded-xl bg-[var(--marketing-section)] p-4">
          <span className="text-sm text-[var(--marketing-text-muted)]">Outstanding</span>
          <span className="font-semibold text-[var(--marketing-accent)]">₫24M</span>
        </div>
      </div>
    ),
    parents: (
      <div className="space-y-2">
        {['Daily report sent', 'Fee reminder', 'Photo shared'].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-xl bg-[var(--marketing-section)] px-4 py-3 text-sm"
          >
            <MessageCircle className="size-4 text-[var(--marketing-primary)]" />
            {item}
          </div>
        ))}
      </div>
    ),
    staff: (
      <div className="grid gap-3 sm:grid-cols-2">
        {['Teachers', 'Assistants', 'Admin', 'Kitchen'].map((role, i) => (
          <div key={role} className="rounded-xl bg-[var(--marketing-section)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--marketing-primary)]">
              {[12, 8, 4, 3][i]}
            </p>
            <p className="text-sm text-[var(--marketing-text-muted)]">{role}</p>
          </div>
        ))}
      </div>
    ),
  };

  return <div className="min-h-[220px]">{panels[active]}</div>;
}

export function ProductShowcaseSection() {
  const [active, setActive] = useState<TabId>('dashboard');
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <MarketingSection id="solutions">
      <SectionHeader
        eyebrow={<Trans i18nKey="marketing:showcaseEyebrow" />}
        title={<Trans i18nKey="marketing:showcaseTitle" />}
        subtitle={<Trans i18nKey="marketing:showcaseSubtitle" />}
        className="mb-12"
      />

      <FadeIn>
        <div className="marketing-card overflow-hidden rounded-2xl">
          <div className="flex flex-wrap gap-2 border-b border-[var(--marketing-border)] bg-[var(--marketing-section)] p-3">
            {tabs.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
                  active === id
                    ? 'bg-white text-[var(--marketing-primary)] shadow-sm'
                    : 'text-[var(--marketing-text-muted)] hover:text-[var(--marketing-text)]',
                )}
              >
                <Icon className="size-4" />
                <Trans i18nKey={labelKey} />
              </button>
            ))}
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-2 md:p-10">
            <div>
              <h3 className="text-2xl font-semibold text-[var(--marketing-text)]">
                <Trans i18nKey={current.titleKey} />
              </h3>
              <p className="mt-3 leading-relaxed text-[var(--marketing-text-muted)]">
                <Trans i18nKey={current.descKey} />
              </p>
            </div>
            <ShowcasePanel active={active} />
          </div>
        </div>
      </FadeIn>
    </MarketingSection>
  );
}

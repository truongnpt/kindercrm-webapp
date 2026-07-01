'use client';

import {
  BarChart3,
  Bell,
  Camera,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Smartphone,
  Users,
} from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import {
  FadeIn,
  MarketingSection,
  SectionHeader,
  Stagger,
  StaggerItem,
} from '~/components/marketing';

const experiences = [
  {
    id: 'parent',
    eyebrowKey: 'marketing:parentEyebrow',
    titleKey: 'marketing:parentTitle',
    subtitleKey: 'marketing:parentSubtitle',
    features: [
      { icon: Bell, key: 'marketing:parentFeature1' },
      { icon: ClipboardList, key: 'marketing:parentFeature2' },
      { icon: Camera, key: 'marketing:parentFeature3' },
      { icon: GraduationCap, key: 'marketing:parentFeature4' },
      { icon: CreditCard, key: 'marketing:parentFeature5' },
    ],
    mockup: 'parent',
  },
  {
    id: 'teacher',
    eyebrowKey: 'marketing:teacherEyebrow',
    titleKey: 'marketing:teacherTitle',
    subtitleKey: 'marketing:teacherSubtitle',
    features: [
      { icon: ClipboardList, key: 'marketing:teacherFeature1' },
      { icon: Users, key: 'marketing:teacherFeature2' },
      { icon: GraduationCap, key: 'marketing:teacherFeature3' },
      { icon: Smartphone, key: 'marketing:teacherFeature4' },
    ],
    mockup: 'teacher',
  },
  {
    id: 'owner',
    eyebrowKey: 'marketing:ownerEyebrow',
    titleKey: 'marketing:ownerTitle',
    subtitleKey: 'marketing:ownerSubtitle',
    features: [
      { icon: BarChart3, key: 'marketing:ownerFeature1' },
      { icon: CreditCard, key: 'marketing:ownerFeature2' },
      { icon: Users, key: 'marketing:ownerFeature3' },
      { icon: GraduationCap, key: 'marketing:ownerFeature4' },
    ],
    mockup: 'owner',
  },
] as const;

function PhoneMockup({ variant }: { variant: string }) {
  const labels: Record<string, string> = {
    parent: 'Parent App',
    teacher: 'Teacher App',
    owner: 'Executive View',
  };

  return (
    <div className="mx-auto w-full max-w-[280px]">
      <div className="rounded-[2rem] border-4 border-[var(--marketing-text)]/10 bg-[var(--marketing-text)] p-2 shadow-2xl">
        <div className="overflow-hidden rounded-[1.5rem] bg-white">
          <div className="bg-[var(--marketing-primary)] px-4 py-6 text-white">
            <p className="text-xs opacity-80">Kinder CRM</p>
            <p className="text-lg font-semibold">{labels[variant]}</p>
          </div>
          <div className="space-y-2 p-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-[var(--marketing-section)]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RolesExperienceSection() {
  return (
    <>
      {experiences.map((exp, index) => (
        <MarketingSection key={exp.id} alt={index % 2 === 1}>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              <SectionHeader
                align="left"
                eyebrow={<Trans i18nKey={exp.eyebrowKey} />}
                title={<Trans i18nKey={exp.titleKey} />}
                subtitle={<Trans i18nKey={exp.subtitleKey} />}
                className="mb-8"
              />

              <Stagger className="grid gap-3 sm:grid-cols-2">
                {exp.features.map(({ icon: Icon, key }) => (
                  <StaggerItem key={key}>
                    <div className="flex items-start gap-3 rounded-xl border border-[var(--marketing-border)] bg-white p-4">
                      <Icon className="mt-0.5 size-5 shrink-0 text-[var(--marketing-primary)]" />
                      <span className="text-sm text-[var(--marketing-text)]">
                        <Trans i18nKey={key} />
                      </span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>

            <FadeIn className={index % 2 === 1 ? 'lg:order-1' : ''}>
              <PhoneMockup variant={exp.mockup} />
            </FadeIn>
          </div>
        </MarketingSection>
      ))}
    </>
  );
}

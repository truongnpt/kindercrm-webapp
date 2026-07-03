import {
  Building2,
  GraduationCap,
  LayoutDashboard,
} from 'lucide-react';

import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';

const STEPS = [
  {
    icon: Building2,
    titleKey: 'kinder:onboarding.steps.setup',
    descriptionKey: 'kinder:onboarding.steps.setupHint',
  },
  {
    icon: GraduationCap,
    titleKey: 'kinder:onboarding.steps.students',
    descriptionKey: 'kinder:onboarding.steps.studentsHint',
  },
  {
    icon: LayoutDashboard,
    titleKey: 'kinder:onboarding.steps.operate',
    descriptionKey: 'kinder:onboarding.steps.operateHint',
  },
] as const;

export function OnboardingHero() {
  return (
    <div className="relative z-10 flex h-full flex-col gap-8">
      <div>
        <AppLogo href={null} />
        <p className="mt-8 text-sm font-semibold tracking-wide text-primary uppercase">
          <Trans i18nKey="kinder:onboarding.badge" />
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          <Trans i18nKey="kinder:onboarding.heroTitle" />
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
          <Trans i18nKey="kinder:onboarding.heroSubtitle" />
        </p>
      </div>

      <ol className="flex flex-col gap-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon;

          return (
            <li className="onboarding-step" key={step.titleKey}>
              <span className="onboarding-step-icon">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  <span className="text-primary">{index + 1}. </span>
                  <Trans i18nKey={step.titleKey} />
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  <Trans i18nKey={step.descriptionKey} />
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-muted-foreground">
        <Trans i18nKey="kinder:onboarding.footerHint" />
      </p>
    </div>
  );
}

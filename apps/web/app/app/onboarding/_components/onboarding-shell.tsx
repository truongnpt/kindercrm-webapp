import { SignOutButton } from '~/components/sign-out-button';

import { OnboardingHero } from './onboarding-hero';

export function OnboardingShell({
  children,
}: React.PropsWithChildren) {
  return (
    <div className="onboarding-root">
      <div className="onboarding-layout">
        <aside className="onboarding-hero">
          <OnboardingHero />
        </aside>

        <div className="onboarding-form-panel">
          <div className="mb-6 flex justify-end lg:absolute lg:top-6 lg:right-8">
            <SignOutButton />
          </div>

          <div className="onboarding-form-card">{children}</div>
        </div>
      </div>
    </div>
  );
}

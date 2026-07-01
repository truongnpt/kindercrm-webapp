import { AppLogo } from '~/components/app-logo';
import { Trans } from '@kit/ui/trans';

export function ComingSoonPanel({ moduleKey }: { moduleKey: string }) {
  return (
    <div className="kinder-surface kinder-empty-glow max-w-lg p-8">
      <h2 className="kinder-section-title">
        <Trans i18nKey="kinder:comingSoon.title" />
      </h2>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        <Trans i18nKey="kinder:comingSoon.description" />
      </p>
      <p className="text-muted-foreground mt-2 text-xs">{moduleKey}</p>
    </div>
  );
}

export function OnboardingShell({ children }: React.PropsWithChildren) {
  return (
    <div className="kinder-workspace flex min-h-screen flex-col">
      <header className="kinder-sticky-header px-6 py-4">
        <AppLogo href={null} />
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="kinder-surface kinder-empty-glow w-full max-w-lg p-8 sm:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

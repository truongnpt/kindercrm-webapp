import { AppLogo } from '~/components/app-logo';
import { Trans } from '@kit/ui/trans';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

export function ComingSoonPanel({ moduleKey }: { moduleKey: string }) {
  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>
          <Trans i18nKey="kinder:comingSoon.title" />
        </CardTitle>
        <CardDescription>
          <Trans i18nKey="kinder:comingSoon.description" />
          <span className="text-muted-foreground mt-2 block text-xs">
            {moduleKey}
          </span>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export function OnboardingShell({ children }: React.PropsWithChildren) {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <header className="border-b bg-background px-6 py-4">
        <AppLogo href={null} />
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="bg-background w-full max-w-lg rounded-xl border p-8 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}

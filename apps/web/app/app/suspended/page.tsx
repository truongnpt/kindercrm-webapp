import Link from 'next/link';

import { PauseCircle } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { SignOutButton } from '~/components/sign-out-button';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { getPlatformAdminContext } from '~/lib/kinder/platform/require-platform-admin';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { redirect } from 'next/navigation';

async function SchoolSuspendedPage() {
  const user = await requireUserInServerComponent();
  const [context, platform] = await Promise.all([
    getSchoolContext(user.id),
    getPlatformAdminContext(user.id),
  ]);

  if (!context || context.school.status !== 'suspended') {
    redirect(pathsConfig.app.home);
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="kinder-surface max-w-lg p-8 text-center">
        <div className="bg-amber-500/10 text-amber-600 mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl">
          <PauseCircle className="size-7" />
        </div>
        <h1 className="kinder-page-title text-2xl">
          <Trans i18nKey="kinder:suspended.title" />
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          <Trans
            i18nKey="kinder:suspended.description"
            values={{ schoolName: context.school.name }}
          />
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          {platform ? (
            <Button asChild>
              <Link href={pathsConfig.platform.schools}>
                <Trans i18nKey="kinder:platform.nav.schools" />
              </Link>
            </Button>
          ) : null}
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export default withI18n(SchoolSuspendedPage);

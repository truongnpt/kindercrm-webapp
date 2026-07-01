import { withI18n } from '~/lib/i18n/with-i18n';
import { requirePlatformAdminPage } from '~/lib/kinder/platform/require-platform-admin';
import { loadUserSchools } from '~/lib/kinder/tenant/get-school-context';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { PlatformShell } from './_components/platform-shell';

async function PlatformLayout({ children }: React.PropsWithChildren) {
  const user = await requireUserInServerComponent();
  const platform = await requirePlatformAdminPage(user.id);
  const memberships = await loadUserSchools(user.id);
  const hasStaffSchool = memberships.some((m) => m.role !== 'parent');

  return (
    <PlatformShell platformRole={platform.role} showWorkspaceLink={hasStaffSchool}>
      {children}
    </PlatformShell>
  );
}

export default withI18n(PlatformLayout);

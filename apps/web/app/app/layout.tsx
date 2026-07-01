import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

async function AppRootLayout({ children }: React.PropsWithChildren) {
  await requireUserInServerComponent();

  return children;
}

export default withI18n(AppRootLayout);

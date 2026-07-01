import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { MarketingAnnouncementBar } from '~/(marketing)/_components/marketing-announcement-bar';
import { MarketingFooter } from '~/(marketing)/_components/marketing-footer';
import { MarketingHeader } from '~/(marketing)/_components/marketing-header';
import { withI18n } from '~/lib/i18n/with-i18n';

async function SiteLayout(props: React.PropsWithChildren) {
  const client = getSupabaseServerClient();

  const { data } = await client.auth.getClaims();

  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <MarketingAnnouncementBar />
      <MarketingHeader user={data?.claims} />
      <main className="flex-1">{props.children}</main>
      <MarketingFooter />
    </div>
  );
}

export default withI18n(SiteLayout);

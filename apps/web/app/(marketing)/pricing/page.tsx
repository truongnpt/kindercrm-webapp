import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { PricingPlans } from '~/(marketing)/pricing/_components/pricing-plans';
import { MarketingPageHeader } from '~/(marketing)/_components/marketing-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:pricing'),
    description: t('marketing:pricingSubtitle'),
  };
}

async function PricingPage() {
  const i18n = await createI18nServerInstance();
  const client = getSupabaseServerClient();

  const { data: authData } = await client.auth.getClaims();
  const isLoggedIn = Boolean(authData?.claims);

  return (
    <div>
      <MarketingPageHeader
        title={i18n.t('marketing:pricing')}
        subtitle={i18n.t('marketing:pricingSubtitle')}
      />

      <div className="container mx-auto px-4 py-12 sm:px-6 md:py-16">
        <PricingPlans isLoggedIn={isLoggedIn} locale={i18n.language} />
      </div>
    </div>
  );
}

export default withI18n(PricingPage);

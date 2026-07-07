import Link from 'next/link';

import { Sparkles } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import {
  BentoGrid,
  BentoTile,
  BentoTileHeader,
  KinderPageBody,
  KinderPageHeader,
  SubscriptionStatusBadge,
} from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { getAiCreditStatus } from '~/lib/kinder/ai/credits';
import { getAiConfig } from '~/lib/kinder/ai/config';
import { processDueCalendarReminders } from '~/lib/kinder/calendar/calendar-notifications';
import { loadUpcomingCalendarEvents } from '~/lib/kinder/calendar/load-calendar';
import { loadDashboardSummary } from '~/lib/kinder/dashboard/load-dashboard';
import { getSubscriptionDisplayStatus, hasSchoolFeature } from '~/lib/kinder/subscription/features';
import { loadSchoolUsageSummary } from '~/lib/kinder/subscription/quotas';
import { getSchoolContext } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { DashboardOverview } from './_components/dashboard-overview';
import { QuotaUsageBanner } from './_components/quota-usage-banner';
import { StaffUpcomingEvents } from './_components/staff-upcoming-events';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:dashboard.title'),
  };
};

async function DashboardPage() {
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  const client = getSupabaseServerClient();
  const hasCalendar = hasSchoolFeature(context, 'calendar');

  const [usageSummary, summary, upcomingEvents] = await Promise.all([
    loadSchoolUsageSummary(client, context),
    loadDashboardSummary(context.school.id),
    hasCalendar
      ? loadUpcomingCalendarEvents(context.school.id, 5)
      : Promise.resolve([]),
  ]);

  if (hasCalendar) {
    try {
      await processDueCalendarReminders(context.school.id);
    } catch (reminderError) {
      console.error('Failed to process calendar reminders', reminderError);
    }
  }

  const hasAi = hasSchoolFeature(context, 'ai_assistant');
  const [aiCredits, aiConfig] = hasAi
    ? await Promise.all([
        getAiCreditStatus(
          context.school.id,
          context.package,
          context.subscription,
        ),
        Promise.resolve(getAiConfig()),
      ])
    : [null, null];

  const trialEnds = context.subscription?.trial_ends_at
    ? new Date(context.subscription.trial_ends_at).toLocaleDateString('vi-VN')
    : null;
  const displayStatus = getSubscriptionDisplayStatus(context.subscription);

  const features = {
    crm: hasSchoolFeature(context, 'crm'),
    students: hasSchoolFeature(context, 'students'),
    finance: hasSchoolFeature(context, 'finance'),
    attendance: hasSchoolFeature(context, 'attendance'),
  };

  return (
    <>
      <KinderPageHeader
        breadcrumbs={[{ label: <Trans i18nKey="kinder:dashboard.title" /> }]}
        description={
          <Trans
            i18nKey="kinder:dashboard.description"
            values={{ schoolName: context.school.name }}
          />
        }
        title={<Trans i18nKey="kinder:dashboard.title" />}
      />

      <KinderPageBody>
        <QuotaUsageBanner
          package={context.package}
          usage={usageSummary.usage}
        />

        <BentoGrid columns={2}>
          <BentoTile>
            <BentoTileHeader
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href={pathsConfig.app.settingsSubscription}>
                    <Trans i18nKey="kinder:subscription.title" />
                  </Link>
                </Button>
              }
              title={<Trans i18nKey="kinder:dashboard.packageLabel" />}
            />
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-foreground text-2xl font-semibold tracking-tight">
                {context.package?.name ?? '—'}
              </p>
              {displayStatus ? (
                <SubscriptionStatusBadge status={displayStatus} />
              ) : null}
            </div>
            {displayStatus === 'trial' && trialEnds ? (
              <p className="text-muted-foreground mt-2 text-sm">
                <Trans
                  i18nKey="kinder:dashboard.trialEnds"
                  values={{ date: trialEnds }}
                />
              </p>
            ) : null}
            {displayStatus === 'trial_expired' && trialEnds ? (
              <p className="text-muted-foreground mt-2 text-sm">
                <Trans
                  i18nKey="kinder:dashboard.trialExpired"
                  values={{ date: trialEnds }}
                />
              </p>
            ) : null}
          </BentoTile>

          {hasAi && aiCredits ? (
            <BentoTile>
              <BentoTileHeader
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href={pathsConfig.app.ai}>
                      <Trans i18nKey="kinder:ai.title" />
                    </Link>
                  </Button>
                }
                title={
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="text-primary size-5" />
                    <Trans i18nKey="kinder:ai.creditsLabel" />
                  </span>
                }
              />
              <p className="text-foreground text-2xl font-semibold tracking-tight">
                {aiCredits.creditsRemaining} / {aiCredits.creditsLimit}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                {aiConfig?.isConfigured ? (
                  <Trans i18nKey="kinder:ai.providerReady" />
                ) : (
                  <Trans i18nKey="kinder:ai.providerFallback" />
                )}
              </p>
            </BentoTile>
          ) : null}
        </BentoGrid>

        {hasCalendar && upcomingEvents.length > 0 ? (
          <StaffUpcomingEvents events={upcomingEvents} />
        ) : null}

        <DashboardOverview features={features} summary={summary} />
      </KinderPageBody>
    </>
  );
}

export default withI18n(DashboardPage);

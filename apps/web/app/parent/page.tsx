import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { loadParentDashboardSummaries } from '~/lib/kinder/parent/load-parent-dashboard';
import { loadParentUpcomingCalendarEvents } from '~/lib/kinder/parent/load-parent-calendar';
import { loadUnreadNotificationCount } from '~/lib/kinder/notifications/load-notifications';

import { ParentDashboard } from '~/components/parent-portal';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:parent.title'),
  };
};

async function ParentHomePage() {
  const user = await requireUserInServerComponent();
  const [summaries, unreadCount, upcomingEvents] = await Promise.all([
    loadParentDashboardSummaries(user.id),
    loadUnreadNotificationCount(user.id),
    loadParentUpcomingCalendarEvents(user.id, 5),
  ]);

  return (
    <ParentDashboard
      summaries={summaries}
      upcomingEvents={upcomingEvents}
      unreadCount={unreadCount}
    />
  );
}

export default withI18n(ParentHomePage);

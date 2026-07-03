import { Trans } from '@kit/ui/trans';

import { ParentSectionHeader } from '~/components/parent-portal';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import {
  loadParentCalendarEvents,
  loadParentCalendarSchools,
  loadParentChildrenForSchool,
  resolveParentCalendarSchool,
} from '~/lib/kinder/parent/load-parent-calendar';
import { loadParentLinksForUser } from '~/lib/kinder/parent/load-parent';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { ParentCalendarFilters } from './_components/parent-calendar-filters';
import { ParentCalendarWorkspace } from './_components/parent-calendar-workspace';

function currentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:parent.calendar.title'),
  };
};

async function ParentCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    date?: string;
    schoolId?: string;
    studentId?: string;
  }>;
}) {
  const params = await searchParams;
  const user = await requireUserInServerComponent();
  const [links, schools] = await Promise.all([
    loadParentLinksForUser(user.id),
    loadParentCalendarSchools(user.id),
  ]);

  const schoolId = resolveParentCalendarSchool(
    schools,
    links,
    params.schoolId,
  );

  if (!schoolId) {
    return null;
  }

  const month = params.month ?? currentMonth();
  const selectedDate = params.date;
  const studentId =
    params.studentId &&
    links.some(
      (link) =>
        link.studentId === params.studentId && link.schoolId === schoolId,
    )
      ? params.studentId
      : undefined;

  const [events, children] = await Promise.all([
    loadParentCalendarEvents({
      userId: user.id,
      schoolId,
      month,
      studentId,
    }),
    loadParentChildrenForSchool(user.id, schoolId),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <ParentSectionHeader
        description={<Trans i18nKey="kinder:parent.calendar.description" />}
        title={<Trans i18nKey="kinder:parent.calendar.title" />}
      />

      <ParentCalendarFilters
        children={children}
        schoolId={schoolId}
        schools={schools}
        studentId={studentId}
      />

      <ParentCalendarWorkspace
        events={events}
        month={month}
        selectedDate={selectedDate}
      />
    </div>
  );
}

export default withI18n(ParentCalendarPage);

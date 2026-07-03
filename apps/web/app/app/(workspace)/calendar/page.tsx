import { Trans } from '@kit/ui/trans';

import { KinderPageBody, KinderPageHeader } from '~/components/kinder-ui';
import pathsConfig from '~/config/paths.config';
import { processDueCalendarReminders } from '~/lib/kinder/calendar/calendar-notifications';
import {
  filterCalendarEvents,
  getWeekStart,
  loadSchoolCalendarEvents,
  resolveCalendarRange,
} from '~/lib/kinder/calendar/load-calendar';
import type { CalendarEventCategory } from '~/lib/kinder/calendar/types';
import { loadActiveClasses } from '~/lib/kinder/attendance/load-attendance';
import { assertModuleAccessFromContext } from '~/lib/kinder/permissions/module-access.server';
import {
  CALENDAR_PERMISSIONS,
  hasPermission,
  loadMemberPermissions,
} from '~/lib/kinder/permissions';
import { requirePackageFeature } from '~/lib/kinder/subscription/features';
import { getSchoolContext, loadCampuses } from '~/lib/kinder/tenant/get-school-context';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { CalendarWorkspace } from './_components/calendar-workspace';
import { CreateCalendarEventDialog } from './_components/create-calendar-event-dialog';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('kinder:calendar.title'),
  };
};

async function loadTeacherClasses(schoolId: string, userId: string) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('classes')
    .select('id, name, code')
    .eq('school_id', schoolId)
    .eq('teacher_user_id', userId)
    .eq('status', 'active')
    .order('name');

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    week?: string;
    date?: string;
    view?: string;
    classId?: string;
    category?: string;
  }>;
}) {
  const params = await searchParams;
  const user = await requireUserInServerComponent();
  const context = await getSchoolContext(user.id);

  if (!context) {
    return null;
  }

  requirePackageFeature(context, 'calendar');
  await assertModuleAccessFromContext(context, pathsConfig.app.calendar, 'view');

  const range = resolveCalendarRange(params);
  const selectedDate = params.date;
  const today = new Date().toISOString().slice(0, 10);
  const month = params.month ?? today.slice(0, 7);
  const weekStart = params.week ?? getWeekStart(selectedDate ?? today);
  const teacherClassOnly = context.role === 'teacher';

  const memberPermissions = await loadMemberPermissions(
    context.school.id,
    context.role,
    context.customRoleId,
  );
  const canManage = hasPermission(
    memberPermissions,
    CALENDAR_PERMISSIONS.EVENTS_MANAGE,
  );

  const [events, campuses, allClasses, teacherClasses] = await Promise.all([
    loadSchoolCalendarEvents(context.school.id, range),
    loadCampuses(context.school.id),
    loadActiveClasses(context.school.id),
    teacherClassOnly
      ? loadTeacherClasses(context.school.id, user.id)
      : Promise.resolve([]),
  ]);

  try {
    await processDueCalendarReminders(context.school.id);
  } catch (reminderError) {
    console.error('Failed to process calendar reminders', reminderError);
  }

  const classes = teacherClassOnly
    ? teacherClasses
    : allClasses.map((cls) => ({
        id: cls.id,
        name: cls.name,
        code: cls.code,
      }));

  const filteredEvents = filterCalendarEvents(events, {
    classId: params.classId,
    category:
      params.category && params.category !== 'all'
        ? (params.category as CalendarEventCategory)
        : undefined,
  });

  return (
    <>
      <KinderPageHeader
        actions={
          canManage ? (
            <CreateCalendarEventDialog
              campuses={campuses.map((campus) => ({
                id: campus.id,
                name: campus.name,
              }))}
              classes={classes.map((cls) => ({
                id: cls.id,
                name: cls.name,
              }))}
              defaultDate={selectedDate}
              schoolId={context.school.id}
              teacherClassOnly={teacherClassOnly}
            />
          ) : null
        }
        breadcrumbs={[{ label: <Trans i18nKey="kinder:calendar.title" /> }]}
        description={<Trans i18nKey="kinder:calendar.description" />}
        title={<Trans i18nKey="kinder:calendar.title" />}
      />

      <KinderPageBody>
        <CalendarWorkspace
          campuses={campuses.map((campus) => ({
            id: campus.id,
            name: campus.name,
          }))}
          canManage={canManage}
          classes={classes.map((cls) => ({
            id: cls.id,
            name: cls.name,
            code: cls.code,
          }))}
          events={filteredEvents}
          month={month}
          schoolId={context.school.id}
          selectedDate={selectedDate}
          teacherClassOnly={teacherClassOnly}
          view={range.view}
          weekStart={weekStart}
        />
      </KinderPageBody>
    </>
  );
}

export default withI18n(CalendarPage);

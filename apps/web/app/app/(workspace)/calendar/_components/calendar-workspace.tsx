'use client';

import { useMemo } from 'react';

import { CalendarDays } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Trans } from '@kit/ui/trans';

import {
  BentoTile,
  DayAgenda,
  EmptyState,
  MonthCalendar,
  TabbedModule,
  TabbedModuleContent,
  TabbedModuleList,
  TabbedModuleTrigger,
  WeekCalendar,
} from '~/components/kinder-ui';
import {
  buildDayAgendaEvents,
  expandCalendarEventsForDisplay,
  expandWeekCalendarEvents,
} from '~/lib/kinder/calendar/display';
import type { SchoolCalendarEvent } from '~/lib/kinder/calendar/types';
import type { CalendarView } from '~/lib/kinder/calendar/load-calendar';

import { CalendarEventRow } from './calendar-event-row';
import { CalendarFilters } from './calendar-filters';

function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

function eventOnDate(event: SchoolCalendarEvent, date: string) {
  const start = toDateKey(event.starts_at);
  const end = toDateKey(event.ends_at);

  return date >= start && date <= end;
}

type CampusOption = { id: string; name: string };
type ClassOption = { id: string; name: string; code: string };

export function CalendarWorkspace({
  events,
  schoolId,
  view,
  month,
  weekStart,
  selectedDate,
  canManage,
  campuses,
  classes,
  teacherClassOnly,
}: {
  events: SchoolCalendarEvent[];
  schoolId: string;
  view: CalendarView;
  month: string;
  weekStart: string;
  selectedDate?: string;
  canManage: boolean;
  campuses: CampusOption[];
  classes: ClassOption[];
  teacherClassOnly: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date().toISOString().slice(0, 10);
  const activeDate = selectedDate ?? today;

  const calendarEvents = useMemo(
    () => expandCalendarEventsForDisplay(events),
    [events],
  );

  const weekEvents = useMemo(() => {
    const end = new Date(`${weekStart}T12:00:00`);
    end.setDate(end.getDate() + 6);
    const weekEnd = end.toISOString().slice(0, 10);

    return expandWeekCalendarEvents(events, weekStart, weekEnd);
  }, [events, weekStart]);

  const dayEvents = useMemo(
    () => buildDayAgendaEvents(events, activeDate),
    [events, activeDate],
  );

  const visibleEvents = useMemo(() => {
    if (view === 'day' || selectedDate) {
      return events.filter((event) => eventOnDate(event, selectedDate ?? activeDate));
    }

    return events;
  }, [events, selectedDate, activeDate, view]);

  const campusMap = useMemo(
    () => new Map(campuses.map((campus) => [campus.id, campus.name])),
    [campuses],
  );
  const classMap = useMemo(
    () => new Map(classes.map((cls) => [cls.id, cls.name])),
    [classes],
  );

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }

    router.push(`?${params.toString()}`);
  };

  const setView = (nextView: string) => {
    const updates: Record<string, string | null> = { view: nextView };

    if (nextView === 'week') {
      updates.week = weekStart;
      updates.date = selectedDate ?? today;
    }

    if (nextView === 'day') {
      updates.date = selectedDate ?? today;
    }

    if (nextView === 'month') {
      updates.month = month;
    }

    updateParams(updates);
  };

  return (
    <BentoTile className="flex flex-col gap-4">
      <CalendarFilters classes={classes} />

      <TabbedModule onValueChange={setView} value={view}>
        <TabbedModuleList className="flex-wrap">
          <TabbedModuleTrigger value="month">
            <Trans i18nKey="kinder:calendar.tabs.month" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="week">
            <Trans i18nKey="kinder:calendar.tabs.week" />
          </TabbedModuleTrigger>
          <TabbedModuleTrigger value="day">
            <Trans i18nKey="kinder:calendar.tabs.day" />
          </TabbedModuleTrigger>
        </TabbedModuleList>

        <TabbedModuleContent value="month">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <MonthCalendar
                events={calendarEvents}
                initialMonth={month}
                onDateSelect={(date) => updateParams({ date, view: 'month' })}
                onMonthChange={(monthKey) =>
                  updateParams({ month: monthKey, date: null })
                }
              />
            {renderEventList()}
          </div>
        </TabbedModuleContent>

        <TabbedModuleContent value="week">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <WeekCalendar
                events={weekEvents}
                onDateSelect={(date) => updateParams({ date, view: 'week' })}
                onWeekChange={(nextWeek) =>
                  updateParams({ week: nextWeek, view: 'week' })
                }
                selectedDate={selectedDate}
                weekStart={weekStart}
              />
            {renderEventList()}
          </div>
        </TabbedModuleContent>

        <TabbedModuleContent value="day">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <DayAgenda date={activeDate} events={dayEvents} />
            {renderEventList()}
          </div>
        </TabbedModuleContent>
      </TabbedModule>
    </BentoTile>
  );

  function renderEventList() {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {selectedDate || view === 'day' ? (
              <Trans
                i18nKey="kinder:calendar.eventsOnDate"
                values={{ date: selectedDate ?? activeDate }}
              />
            ) : (
              <Trans i18nKey="kinder:calendar.workspaceTitle" />
            )}
          </h2>
          <p className="text-muted-foreground text-sm">
            <Trans i18nKey="kinder:calendar.workspaceHint" />
          </p>
        </div>

        {visibleEvents.length === 0 ? (
          <EmptyState
            descriptionKey="kinder:calendar.emptyDescription"
            icon={CalendarDays}
            titleKey="kinder:calendar.empty"
            className='border shadow-none'
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visibleEvents.map((event) => (
              <CalendarEventRow
                campuses={campuses}
                canManage={canManage}
                classMap={classMap}
                classes={classes}
                event={event}
                key={event.id}
                schoolId={schoolId}
                scopeLabel={resolveScopeLabel(event, campusMap, classMap)}
                teacherClassOnly={teacherClassOnly}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

function resolveScopeLabel(
  event: SchoolCalendarEvent,
  campusMap: Map<string, string>,
  classMap: Map<string, string>,
) {
  if (event.scope_type === 'class' && event.class_id) {
    return classMap.get(event.class_id) ?? '';
  }

  if (event.scope_type === 'campus' && event.campus_id) {
    return campusMap.get(event.campus_id) ?? '';
  }

  return '';
}

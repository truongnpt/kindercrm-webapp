'use client';

import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarRange, DoorOpen, Plus, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import {
  BentoGrid,
  BentoTile,
  BentoTileHeader,
  KinderFormDialog,
  KinderSubmitButton,
  kinderQueryKeys,
  PanelEmpty,
  useKinderMutation,
} from '~/components/kinder-ui';
import {
  CreateClassroomSchema,
  CreateSchoolYearSchema,
} from '~/lib/kinder/classes/schemas/class.schema';
import {
  createClassroomAction,
  createSchoolYearAction,
} from '~/lib/kinder/classes/server-actions';
import type { Classroom, SchoolYear } from '~/lib/kinder/classes/types';

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function buildSchoolYearDefaults(schoolId: string, name: string) {
  const year = new Date().getFullYear();

  return {
    schoolId,
    name,
    startDate: `${year}-09-01`,
    endDate: `${year + 1}-05-31`,
    isCurrent: true,
  };
}

export function ClassesSetupPanel({
  schoolId,
  schoolYears,
  classrooms,
}: {
  schoolId: string;
  schoolYears: SchoolYear[];
  classrooms: Classroom[];
}) {
  const { t } = useTranslation('kinder');
  const [yearOpen, setYearOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);

  const defaultYearName = useMemo(
    () => {
      const year = new Date().getFullYear();
      return t('classes.defaultSchoolYearName', {
        start: year,
        end: year + 1,
      });
    },
    [t],
  );

  const yearForm = useForm({
    resolver: zodResolver(CreateSchoolYearSchema),
    defaultValues: buildSchoolYearDefaults(schoolId, defaultYearName),
  });

  const roomForm = useForm({
    resolver: zodResolver(CreateClassroomSchema),
    defaultValues: {
      schoolId,
      name: '',
      capacity: 30,
      campusId: '',
    },
  });

  const createSchoolYear = useKinderMutation({
    mutationFn: createSchoolYearAction,
    invalidateKeys: [kinderQueryKeys.classes.all(schoolId)],
    onSuccess: () => {
      yearForm.reset(buildSchoolYearDefaults(schoolId, defaultYearName));
      setYearOpen(false);
    },
  });

  const createClassroom = useKinderMutation({
    mutationFn: createClassroomAction,
    invalidateKeys: [kinderQueryKeys.classes.all(schoolId)],
    onSuccess: () => {
      roomForm.reset({ schoolId, name: '', capacity: 30, campusId: '' });
      setRoomOpen(false);
    },
  });

  return (
    <BentoGrid columns={2}>
      <BentoTile>
        <div className="flex items-start justify-between gap-3">
          <BentoTileHeader
            description={<Trans i18nKey="kinder:classes.schoolYearsHint" />}
            title={<Trans i18nKey="kinder:classes.schoolYears" />}
          />
          <Button className="shrink-0"
 onClick={() => setYearOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="mr-1.5 size-4" />
            <Trans i18nKey="kinder:classes.addSchoolYear" />
          </Button>
        </div>

        {schoolYears.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {schoolYears.map((schoolYear) => (
              <li
                className="flex items-start justify-between gap-3 rounded-2xl bg-muted/25 px-4 py-3 text-sm"
                key={schoolYear.id}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <CalendarRange className="text-primary mt-0.5 size-4 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">{schoolYear.name}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatDateLabel(schoolYear.start_date)}
                      {' → '}
                      {formatDateLabel(schoolYear.end_date)}
                    </p>
                  </div>
                </div>
                {schoolYear.is_current ? (
                  <Badge className="shrink-0" variant="secondary">
                    <Trans i18nKey="kinder:classes.currentYear" />
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <PanelEmpty messageKey="kinder:classes.schoolYearsEmpty" />
          </div>
        )}
      </BentoTile>

      <BentoTile>
        <div className="flex items-start justify-between gap-3">
          <BentoTileHeader
            description={<Trans i18nKey="kinder:classes.classroomsHint" />}
            title={<Trans i18nKey="kinder:classes.classrooms" />}
          />
          <Button className="shrink-0"
 onClick={() => setRoomOpen(true)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Plus className="mr-1.5 size-4" />
            <Trans i18nKey="kinder:classes.addClassroom" />
          </Button>
        </div>

        {classrooms.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {classrooms.map((classroom) => (
              <li
                className="flex items-center justify-between gap-3 rounded-2xl bg-muted/25 px-4 py-3 text-sm"
                key={classroom.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <DoorOpen className="text-primary size-4 shrink-0" />
                  <span className="font-medium">{classroom.name}</span>
                </div>
                <span className="text-muted-foreground flex shrink-0 items-center gap-1.5 text-xs">
                  <Users className="size-3.5" />
                  <Trans
                    i18nKey="kinder:classes.capacitySeats"
                    values={{ count: classroom.capacity }}
                  />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4">
            <PanelEmpty messageKey="kinder:classes.classroomsEmpty" />
          </div>
        )}
      </BentoTile>

      <KinderFormDialog
        footer={
          <KinderSubmitButton
            loading={createSchoolYear.isPending}
            onClick={yearForm.handleSubmit((data) =>
              createSchoolYear.mutate(data),
            )}
            type="button"
          >
            <Trans i18nKey="kinder:classes.addSchoolYear" />
          </KinderSubmitButton>
        }
        onOpenChange={setYearOpen}
        open={yearOpen}
        size="sm"
        title={<Trans i18nKey="kinder:classes.addSchoolYear" />}
      >
        <Form {...yearForm}>
          <form className="space-y-4">
            <FormField
              control={yearForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.schoolYear" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={yearForm.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:classes.startDate" />
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={yearForm.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="kinder:classes.endDate" />
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} required />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={yearForm.control}
              name="isCurrent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-3 space-y-0 rounded-xl border border-border p-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      <Trans i18nKey="kinder:classes.setAsCurrentYear" />
                    </FormLabel>
                    <FormDescription>
                      <Trans i18nKey="kinder:classes.setAsCurrentYearHint" />
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </KinderFormDialog>

      <KinderFormDialog
        footer={
          <KinderSubmitButton
            loading={createClassroom.isPending}
            onClick={roomForm.handleSubmit((data) =>
              createClassroom.mutate(data),
            )}
            type="button"
          >
            <Trans i18nKey="kinder:classes.addClassroom" />
          </KinderSubmitButton>
        }
        onOpenChange={setRoomOpen}
        open={roomOpen}
        size="sm"
        title={<Trans i18nKey="kinder:classes.addClassroom" />}
      >
        <Form {...roomForm}>
          <form className="space-y-4">
            <FormField
              control={roomForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.classroom" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={roomForm.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="kinder:classes.roomCapacity" />
                  </FormLabel>
                  <FormControl>
                    <Input min={1} type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </KinderFormDialog>
    </BentoGrid>
  );
}

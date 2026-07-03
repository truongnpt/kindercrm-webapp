import { z } from 'zod';

import { CALENDAR_EVENT_CATEGORIES } from '../types';

const categoryEnum = z.enum(CALENDAR_EVENT_CATEGORIES);
const scopeTypeEnum = z.enum(['school', 'campus', 'class']);

const CalendarEventFieldsSchema = z
  .object({
    schoolId: z.string().uuid(),
    title: z.string().min(1).max(255),
    description: z.string().max(5000).optional(),
    category: categoryEnum,
    scopeType: scopeTypeEnum.default('school'),
    campusId: z.string().uuid().optional().or(z.literal('')),
    classId: z.string().uuid().optional().or(z.literal('')),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    allDay: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    remindDaysBefore: z.coerce.number().int().min(0).max(30).nullable().optional(),
    notifyOnCreate: z.boolean().default(true),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })
  .refine(
    (data) => data.scopeType !== 'campus' || Boolean(data.campusId),
    {
      message: 'Campus is required for campus-scoped events',
      path: ['campusId'],
    },
  )
  .refine((data) => data.scopeType !== 'class' || Boolean(data.classId), {
    message: 'Class is required for class-scoped events',
    path: ['classId'],
  });

export { CalendarEventFieldsSchema };

export const CreateCalendarEventSchema = CalendarEventFieldsSchema;

export const UpdateCalendarEventSchema = z.intersection(
  CalendarEventFieldsSchema,
  z.object({
    eventId: z.string().uuid(),
  }),
);

export const DeleteCalendarEventSchema = z.object({
  schoolId: z.string().uuid(),
  eventId: z.string().uuid(),
});

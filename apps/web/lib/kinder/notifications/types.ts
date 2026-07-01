import type { Database } from '~/lib/database.types';

export type UserNotification =
  Database['public']['Tables']['user_notifications']['Row'];

export type NotificationCategory =
  Database['public']['Enums']['notification_category'];

/*
 * SUB-008: notification_category value for trial / subscription alerts.
 */

alter type public.notification_category add value if not exists 'subscription';

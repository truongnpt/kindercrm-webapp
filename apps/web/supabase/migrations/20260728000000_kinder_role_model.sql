/*
 * Step 1/2: Add enum values only.
 * PostgreSQL forbids using a new enum value in the same transaction
 * as ALTER TYPE ... ADD VALUE (SQLSTATE 55P04).
 */

alter type public.school_member_role add value if not exists 'manager';

alter type public.staff_access_role add value if not exists 'manager';

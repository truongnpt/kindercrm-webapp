import 'server-only';

import pathsConfig from '~/config/paths.config';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { createUserNotification } from './load-notifications';
import { loadSchoolStaffUserIds, notifyStaffUsers } from './staff-notifications';

async function loadParentUserIdsForStudent(schoolId: string, studentId: string) {
  const client = getSupabaseServerClient();

  const { data, error } = await client
    .from('parent_student_links')
    .select('user_id')
    .eq('school_id', schoolId)
    .eq('student_id', studentId);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => row.user_id);
}

export async function notifyParentsOfPaymentVerified(input: {
  schoolId: string;
  studentId: string;
  studentName: string;
  invoiceId: string;
  invoiceNumber: string;
  receiptNumber: string;
  amount: number;
}) {
  const parentUserIds = await loadParentUserIdsForStudent(
    input.schoolId,
    input.studentId,
  );

  const linkUrl = `${pathsConfig.parent.child}/${input.studentId}?tab=finance`;
  const body = `Phiếu thu ${input.receiptNumber} — ${input.invoiceNumber}`;

  await Promise.all(
    parentUserIds.map((userId) =>
      createUserNotification({
        schoolId: input.schoolId,
        userId,
        category: 'finance',
        title: `Thanh toán đã xác nhận: ${input.studentName}`,
        body,
        linkUrl,
        referenceType: 'invoice_payment',
        referenceId: input.invoiceId,
      }),
    ),
  );
}

export async function notifyParentsOfPaymentRejected(input: {
  schoolId: string;
  studentId: string;
  studentName: string;
  invoiceId: string;
  invoiceNumber: string;
  note?: string | null;
}) {
  const parentUserIds = await loadParentUserIdsForStudent(
    input.schoolId,
    input.studentId,
  );

  const linkUrl = `${pathsConfig.parent.child}/${input.studentId}?tab=finance`;

  await Promise.all(
    parentUserIds.map((userId) =>
      createUserNotification({
        schoolId: input.schoolId,
        userId,
        category: 'finance',
        title: `Thanh toán bị từ chối: ${input.studentName}`,
        body: input.note ?? input.invoiceNumber,
        linkUrl,
        referenceType: 'invoice_payment',
        referenceId: input.invoiceId,
      }),
    ),
  );
}

export async function notifyStaffOfPaymentSubmitted(input: {
  schoolId: string;
  studentId: string;
  studentName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
}) {
  const staffUserIds = await loadSchoolStaffUserIds(input.schoolId);
  const linkUrl = `${pathsConfig.app.finance}?tab=verification`;

  await notifyStaffUsers({
    schoolId: input.schoolId,
    userIds: staffUserIds,
    category: 'finance',
    title: `Thanh toán chờ xác nhận: ${input.studentName}`,
    body: `${input.invoiceNumber} — ${input.amount.toLocaleString('vi-VN')} ₫`,
    linkUrl,
    referenceType: 'invoice_payment_pending',
    referenceId: input.invoiceId,
    skipIfUnreadDuplicate: true,
  });
}

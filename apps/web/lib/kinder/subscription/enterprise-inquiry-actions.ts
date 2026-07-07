'use server';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import { KINDER_ERROR_CODES, KinderError } from '~/lib/kinder/errors';

import { notifyEnterpriseSalesTeam } from './notify-enterprise-sales';
import { SubmitEnterpriseInquirySchema } from './schemas/enterprise-inquiry.schema';

async function assertSchoolOwner(schoolId: string, userId: string) {
  const client = getSupabaseServerClient();

  const { data: member, error } = await client
    .from('school_members')
    .select('role')
    .eq('school_id', schoolId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (member?.role !== 'owner') {
    throw new KinderError(
      KINDER_ERROR_CODES.PERMISSION_DENIED,
      KINDER_ERROR_CODES.PERMISSION_DENIED,
    );
  }
}

/** SUB-015: Submit Enterprise sales inquiry (owner only). */
export const submitEnterpriseInquiryAction = enhanceAction(
  async (data, user) => {
    await assertSchoolOwner(data.schoolId, user.sub!);

    const client = getSupabaseServerClient();

    const [{ data: school, error: schoolError }, { data: account }] =
      await Promise.all([
        client
          .from('schools')
          .select('id, name, slug')
          .eq('id', data.schoolId)
          .is('deleted_at', null)
          .single(),
        client
          .from('accounts')
          .select('name, email')
          .eq('id', user.sub!)
          .maybeSingle(),
      ]);

    if (schoolError || !school) {
      throw new KinderError(
        KINDER_ERROR_CODES.SCHOOL_NOT_FOUND,
        KINDER_ERROR_CODES.SCHOOL_NOT_FOUND,
      );
    }

    const { data: inquiry, error } = await client
      .from('enterprise_inquiries')
      .insert({
        school_id: data.schoolId,
        submitted_by_user_id: user.sub!,
        contact_name: data.contactName,
        phone: data.phone,
        campus_count: data.campusCount,
        notes: data.notes || null,
      })
      .select('id')
      .single();

    if (error || !inquiry) {
      throw error ?? new Error('Failed to save enterprise inquiry');
    }

    try {
      await notifyEnterpriseSalesTeam({
        schoolName: school.name,
        schoolSlug: school.slug,
        contactName: data.contactName,
        phone: data.phone,
        campusCount: data.campusCount,
        notes: data.notes ?? null,
        submitterName: account?.name ?? null,
        submitterEmail: account?.email ?? user.email ?? null,
      });
    } catch (mailError) {
      console.error('[enterprise-inquiry] email notification failed', mailError);
    }

    return { success: true, inquiryId: inquiry.id };
  },
  { schema: SubmitEnterpriseInquirySchema },
);

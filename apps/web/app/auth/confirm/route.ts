import { NextRequest, NextResponse } from 'next/server';

import { createAuthCallbackService } from '@kit/supabase/auth';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const type = requestUrl.searchParams.get('type');
  const isInvite = type === 'invite';

  const client = getSupabaseServerClient();
  const service = createAuthCallbackService(client);

  const url = await service.verifyTokenHash(request, {
    redirectPath: isInvite
      ? pathsConfig.auth.passwordUpdate
      : pathsConfig.app.home,
  });

  if (isInvite && !url.searchParams.get('error')) {
    const { data: authData } = await client.auth.getUser();

    if (authData.user?.id) {
      const admin = getSupabaseServerAdminClient();

      await admin
        .from('staff_employees')
        .update({ invite_accepted_at: new Date().toISOString() })
        .eq('user_id', authData.user.id)
        .is('invite_accepted_at', null);
    }
  }

  return NextResponse.redirect(url);
}

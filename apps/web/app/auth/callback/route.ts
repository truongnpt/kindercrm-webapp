import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { createAuthCallbackService } from '@kit/supabase/auth';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import {
  isSafeInternalRedirectPath,
  resolvePostLoginPath,
} from '~/lib/kinder/auth/resolve-post-login-path';

export async function GET(request: NextRequest) {
  const client = getSupabaseServerClient();
  const service = createAuthCallbackService(client);
  const explicitNext = request.nextUrl.searchParams.get('next');

  const { nextPath } = await service.exchangeCodeForSession(request, {
    redirectPath: pathsConfig.auth.postLogin,
  });

  const { data } = await client.auth.getClaims();

  if (data?.claims?.sub) {
    if (explicitNext && isSafeInternalRedirectPath(explicitNext)) {
      return redirect(explicitNext);
    }

    return redirect(await resolvePostLoginPath(data.claims.sub));
  }

  return redirect(nextPath);
}

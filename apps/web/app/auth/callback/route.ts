import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { createAuthCallbackService } from '@kit/supabase/auth';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { resolvePostLoginPath } from '~/lib/kinder/parent/load-parent';

export async function GET(request: NextRequest) {
  const client = getSupabaseServerClient();
  const service = createAuthCallbackService(client);

  const { nextPath } = await service.exchangeCodeForSession(request, {
    redirectPath: pathsConfig.app.home,
  });

  const { data } = await client.auth.getClaims();

  if (data?.claims?.sub) {
    const resolved = await resolvePostLoginPath(data.claims.sub);

    return redirect(resolved);
  }

  return redirect(nextPath);
}

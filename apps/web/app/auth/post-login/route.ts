import { redirect } from 'next/navigation';

import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';
import { resolvePostLoginPath } from '~/lib/kinder/auth/resolve-post-login-path';

export async function GET() {
  const client = getSupabaseServerClient();
  const { data } = await client.auth.getClaims();

  if (!data?.claims?.sub) {
    redirect(pathsConfig.auth.signIn);
  }

  redirect(await resolvePostLoginPath(data.claims.sub));
}

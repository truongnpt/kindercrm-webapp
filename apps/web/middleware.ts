import type { NextRequest } from 'next/server';
import { NextResponse, URLPattern } from 'next/server';

import { CsrfError, createCsrfProtect } from '@edge-csrf/nextjs';

import { checkRequiresMultiFactorAuthentication } from '@kit/supabase/check-requires-mfa';
import { createMiddlewareClient } from '@kit/supabase/middleware-client';

import appConfig from '~/config/app.config';
import pathsConfig from '~/config/paths.config';

const CSRF_SECRET_COOKIE = 'csrfSecret';
const NEXT_ACTION_HEADER = 'next-action';

export const config = {
  matcher: ['/((?!_next/static|_next/image|images|locales|assets|api/*).*)'],
};

const getUser = (request: NextRequest, response: NextResponse) => {
  const supabase = createMiddlewareClient(request, response);

  return supabase.auth.getClaims();
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  setRequestId(request);

  const csrfResponse = await withCsrfMiddleware(request, response);

  const handlePattern = matchUrlPattern(request.url);

  if (handlePattern) {
    const patternHandlerResponse = await handlePattern(request, csrfResponse);

    if (patternHandlerResponse) {
      return patternHandlerResponse;
    }
  }

  if (isServerAction(request)) {
    csrfResponse.headers.set('x-action-path', request.nextUrl.pathname);
  }

  return csrfResponse;
}

async function withCsrfMiddleware(
  request: NextRequest,
  response = new NextResponse(),
) {
  const csrfProtect = createCsrfProtect({
    cookie: {
      secure: appConfig.production,
      name: CSRF_SECRET_COOKIE,
    },
    ignoreMethods: isServerAction(request)
      ? ['POST']
      : ['GET', 'HEAD', 'OPTIONS'],
  });

  try {
    await csrfProtect(request, response);

    return response;
  } catch (error) {
    if (error instanceof CsrfError) {
      return NextResponse.json('Invalid CSRF token', {
        status: 401,
      });
    }

    throw error;
  }
}

function isServerAction(request: NextRequest) {
  const headers = new Headers(request.headers);

  return headers.has(NEXT_ACTION_HEADER);
}

function getPatterns() {
  return [
    {
      pattern: new URLPattern({ pathname: '/auth/*?' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const { data } = await getUser(req, res);

        if (!data?.claims) {
          return;
        }

        const isVerifyMfa = req.nextUrl.pathname === pathsConfig.auth.verifyMfa;

        if (!isVerifyMfa) {
          const client = createMiddlewareClient(req, res);
          const userId = data.claims.sub as string;

          const [{ data: memberships }, { data: platformAdmin }] =
            await Promise.all([
              client
                .from('school_members')
                .select('role')
                .eq('user_id', userId)
                .is('deleted_at', null),
              client
                .from('platform_admins')
                .select('id')
                .eq('user_id', userId)
                .eq('is_active', true)
                .is('revoked_at', null)
                .maybeSingle(),
            ]);

          const hasStaffMembership = (memberships ?? []).some(
            (membership) => membership.role !== 'parent',
          );

          let redirectPath = pathsConfig.app.home;

          if (!hasStaffMembership) {
            const { count: parentCount } = await client
              .from('parent_student_links')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', userId);

            if ((parentCount ?? 0) > 0) {
              redirectPath = pathsConfig.parent.home;
            } else if (platformAdmin) {
              redirectPath = pathsConfig.platform.home;
            } else {
              redirectPath = pathsConfig.app.onboarding;
            }
          }

          return NextResponse.redirect(
            new URL(redirectPath, req.nextUrl.origin).href,
          );
        }
      },
    },
    {
      pattern: new URLPattern({ pathname: '/app/*?' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const { data } = await getUser(req, res);

        const origin = req.nextUrl.origin;
        const next = req.nextUrl.pathname;

        if (!data?.claims) {
          const signIn = pathsConfig.auth.signIn;
          const redirectPath = `${signIn}?next=${next}`;

          return NextResponse.redirect(new URL(redirectPath, origin).href);
        }

        const supabase = createMiddlewareClient(req, res);

        const requiresMultiFactorAuthentication =
          await checkRequiresMultiFactorAuthentication(supabase);

        if (requiresMultiFactorAuthentication) {
          return NextResponse.redirect(
            new URL(pathsConfig.auth.verifyMfa, origin).href,
          );
        }
      },
    },
    {
      pattern: new URLPattern({ pathname: '/platform/*?' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const { data } = await getUser(req, res);

        const origin = req.nextUrl.origin;
        const next = req.nextUrl.pathname;

        if (!data?.claims) {
          const signIn = pathsConfig.auth.signIn;
          const redirectPath = `${signIn}?next=${next}`;

          return NextResponse.redirect(new URL(redirectPath, origin).href);
        }

        const supabase = createMiddlewareClient(req, res);
        const userId = data.claims.sub as string;

        const requiresMultiFactorAuthentication =
          await checkRequiresMultiFactorAuthentication(supabase);

        if (requiresMultiFactorAuthentication) {
          return NextResponse.redirect(
            new URL(pathsConfig.auth.verifyMfa, origin).href,
          );
        }

        const { data: platformAdmin } = await supabase
          .from('platform_admins')
          .select('id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .is('revoked_at', null)
          .maybeSingle();

        if (!platformAdmin) {
          return NextResponse.redirect(new URL(pathsConfig.app.home, origin).href);
        }
      },
    },
    {
      pattern: new URLPattern({ pathname: '/parent/*?' }),
      handler: async (req: NextRequest, res: NextResponse) => {
        const { data } = await getUser(req, res);

        const origin = req.nextUrl.origin;
        const next = req.nextUrl.pathname;

        if (!data?.claims) {
          const signIn = pathsConfig.auth.signIn;
          const redirectPath = `${signIn}?next=${next}`;

          return NextResponse.redirect(new URL(redirectPath, origin).href);
        }

        const supabase = createMiddlewareClient(req, res);

        const requiresMultiFactorAuthentication =
          await checkRequiresMultiFactorAuthentication(supabase);

        if (requiresMultiFactorAuthentication) {
          return NextResponse.redirect(
            new URL(pathsConfig.auth.verifyMfa, origin).href,
          );
        }
      },
    },
  ];
}

function matchUrlPattern(url: string) {
  const patterns = getPatterns();
  const input = url.split('?')[0];

  for (const pattern of patterns) {
    const patternResult = pattern.pattern.exec(input);

    if (patternResult !== null && 'pathname' in patternResult) {
      return pattern.handler;
    }
  }
}

function setRequestId(request: Request) {
  request.headers.set('x-correlation-id', crypto.randomUUID());
}

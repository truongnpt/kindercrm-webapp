'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { AppLogo } from '~/components/app-logo';
import pathsConfig from '~/config/paths.config';

export function AuthShell({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const isSignUp = pathname === '/auth/sign-up';
  const isSignIn = pathname === '/auth/sign-in';
  const isPasswordReset = pathname === '/auth/password-reset';
  const isUpdatePassword = pathname === '/update-password';
  const headingKey =
    isSignUp ?
      'auth:signUpHeading'
    : isPasswordReset ?
      'auth:passwordResetLabel'
    : isUpdatePassword ?
      'auth:updatePasswordHeading'
    : 'auth:signInHeading';
  const subtitleKey =
    isSignUp ?
      'auth:signUpSubheading'
    : isPasswordReset ?
      'auth:passwordResetSubheading'
    : isUpdatePassword ?
      'auth:updatePasswordSubheading'
    : 'auth:signInSubheading';
  const showAccountToggle = !isPasswordReset && !isUpdatePassword;

  function AuthLogo({ className }: { className?: string }) {
    return (
      <div className="flex w-full justify-center">
        <AppLogo
          className={cn(
            className,
            'mx-auto object-center drop-shadow-[0_10px_24px_rgba(3,76,248,0.2)]',
          )}
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--marketing-section)] px-4 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 animate-pulse rounded-full bg-[var(--marketing-primary)]/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-[-80px] h-80 w-80 animate-pulse rounded-full bg-[var(--marketing-accent)]/25 blur-3xl"
      />

      <div className="animate-in fade-in zoom-in-95 slide-in-from-bottom-4 relative z-10 w-full max-w-md duration-700">
        <div className="mb-6 flex justify-center">
          <AuthLogo className="h-16 w-auto sm:h-20" />
        </div>

        <div className="mb-5 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--marketing-text)]">
            <Trans i18nKey={headingKey} />
          </h1>
          <p className="text-sm text-[var(--marketing-text-muted)]">
            <Trans i18nKey={subtitleKey} />
          </p>
        </div>

        <div className="rounded-2xl bg-white/95 p-5 shadow-[0_30px_80px_rgba(3,76,248,0.16),0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5 sm:p-6">
          {children}
        </div>

        {showAccountToggle ? (
          <div className="mt-4 flex justify-center">
            <Link
              href={isSignIn ? pathsConfig.auth.signUp : pathsConfig.auth.signIn}
              className="text-sm font-medium text-[var(--marketing-primary)] hover:underline"
            >
              <Trans
                i18nKey={
                  isSignIn ?
                    'auth:doNotHaveAccountYet'
                  : 'auth:alreadyHaveAnAccount'
                }
              />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

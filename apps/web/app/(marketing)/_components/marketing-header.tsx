'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import type { JwtPayload } from '@supabase/supabase-js';
import { Menu, X } from 'lucide-react';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';
import { LanguageToggle } from '@kit/ui/language-toggle';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { AppLogo } from '~/components/app-logo';
import {
  MarketingButton,
  RequestDemoButton,
} from '~/components/marketing';
import pathsConfig from '~/config/paths.config';
import appConfig from '@/config/app.config';

const navLinks = [
  { href: '/#features', label: 'marketing:navFeatures', match: 'hash' as const },
  { href: '/#solutions', label: 'marketing:navSolutions', match: 'hash' as const },
  { href: '/pricing', label: 'marketing:pricing', match: 'path' as const },
  { href: '/faq', label: 'marketing:faq', match: 'path' as const },
] as const;

export function useHash() {
  const [hash, setHash] = useState('');

  useEffect(() => {
    const updateHash = () => {
      setHash(window.location.hash);
    };

    updateHash();
    window.addEventListener('hashchange', updateHash);

    return () => {
      window.removeEventListener('hashchange', updateHash);
    };
  }, []);

  return hash;
}


export function MarketingHeader({ user }: { user?: JwtPayload | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const hash = useHash();
  const isActive = useCallback((link: (typeof navLinks)[number]) => {
    if (link.match === 'path') {
      return pathname === link.href;
    } else if (link.match === 'hash') {
      return link.href === `/${hash}`;
    }

    return false;
  },[hash, pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled ?
            'marketing-glass backdrop-blur-sm border-b border-[var(--marketing-border)] py-0 shadow-[0_1px_0_0_rgba(0,0,0,0.03)]'
          : 'bg-white/60 py-1 ',
        )}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div
            className={cn(
              'grid grid-cols-[auto_1fr_auto] items-center gap-3 transition-[height] duration-300',
              scrolled ? 'h-14' : 'h-16 lg:h-[4.25rem]',
            )}
          >
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0"
              aria-label={`${appConfig.name} home`}
              onClick={closeMobile}
            >
              <AppLogo href={null} className="!h-8 w-auto sm:!h-9" />
            </Link>

            {/* Desktop nav — centered */}
            <nav
              className="hidden justify-center lg:flex"
              aria-label="Main navigation"
            >
              <ul className="inline-flex items-center gap-0.5 rounded-full border border-[var(--marketing-border)]/80 bg-[var(--marketing-section)]/80 p-2">
                {navLinks.map((link) => {
                  const active = isActive(link);

                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className={cn(
                          'relative rounded-full px-2 py-1.5 text-sm font-medium transition-all duration-200',
                          active ?
                            'bg-white text-[var(--marketing-primary)] shadow-sm'
                          : 'text-[var(--marketing-text-muted)] hover:text-primary hover:bg-white hover:shadow-sm',
                        )}
                      >
                        <Trans i18nKey={link.label} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Desktop actions */}
            <div className="hidden items-center justify-end gap-1.5 lg:flex xl:gap-2">
              <LanguageToggle />

              {user ?
                <>
                  {/* <MarketingButton
                    href={pathsConfig.app.home}
                    variant="outline"
                    size="sm"
                  >
                    <Trans i18nKey="marketing:ctaGoToDashboard" />
                  </MarketingButton> */}
                  <MarketingAccountMenu user={user} />
                </>
              : <>
                  <MarketingButton
                    href={pathsConfig.auth.signIn}
                    variant="ghost"
                    size="sm"
                    className="hidden xl:inline-flex"
                  >
                    <Trans i18nKey="auth:signIn" />
                  </MarketingButton>

                  <div
                    aria-hidden
                    className="mx-1 hidden h-5 w-px bg-[var(--marketing-border)] xl:block"
                  />

                  <RequestDemoButton size="sm" showArrow={false} />
                </>
              }
            </div>

            {/* Mobile toggle */}
            <button
              type="button"
              className="inline-flex size-9 ml-auto lg:ml-unset items-center justify-center rounded-lg text-[var(--marketing-text)] transition-colors hover:bg-[var(--marketing-section)] lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="marketing-mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ?
                <X className="size-5" />
              : <Menu className="size-5" />}
            </button>
            {user && (
              <div className='lg:hidden'><MarketingAccountMenu user={user} /></div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        id="marketing-mobile-menu"
        className={cn(
          'fixed inset-0 z-100 lg:hidden',
          mobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={cn(
            'absolute inset-0 bg-[var(--marketing-text)]/20 backdrop-blur-sm transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="Close menu"
          onClick={closeMobile}
        />

        <div
          className={cn(
            'marketing-glass absolute top-0 right-0 flex h-full w-full max-w-sm flex-col border-l border-[var(--marketing-border)] bg-white shadow-2xl transition-transform duration-300 ease-out',
            mobileOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-[var(--marketing-border)] px-5">
            <AppLogo href={null} className="!h-8 w-auto" />
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-[var(--marketing-section)]"
              aria-label="Close menu"
              onClick={closeMobile}
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            {navLinks.map((link) => {
              const active = isActive(link);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-xl px-4 py-3.5 text-base font-medium transition-colors',
                    active ?
                      'bg-[var(--marketing-primary)]/8 text-[var(--marketing-primary)]'
                    : 'text-[var(--marketing-text)] hover:bg-[var(--marketing-section)]',
                  )}
                  onClick={closeMobile}
                >
                  <Trans i18nKey={link.label} />
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3 border-t border-[var(--marketing-border)] p-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm text-[var(--marketing-text-muted)]">
                <Trans i18nKey="marketing:navLanguage" defaults="Language" />
              </span>
              <LanguageToggle />
            </div>

             {!user && (
              <div className="flex flex-col gap-2">
                <RequestDemoButton
                  size="default"
                  className="w-full justify-center"
                />
                <MarketingButton
                  href={pathsConfig.auth.signIn}
                  variant="ghost"
                  className="w-full justify-center"
                >
                  <Trans i18nKey="auth:signIn" />
                </MarketingButton>
              </div>
             )}
          </div>
        </div>
      </div>
    </>
  );
}

function MarketingAccountMenu({ user }: { user: JwtPayload }) {
  const signOut = useSignOut();
  const userQuery = useUser(user);
  const userData = userQuery.data ?? user;

  return (
    <PersonalAccountDropdown
      showProfileName={false}
      paths={{ home: pathsConfig.app.home }}
      features={{ enableThemeToggle: false }}
      user={userData}
      signOutRequested={() => signOut.mutateAsync()}
    />
  );
}

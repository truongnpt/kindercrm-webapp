'use client';

import { usePathname } from 'next/navigation';

import { AuthLayoutShell } from '@kit/auth/shared';
import { cn } from '@kit/ui/utils';

import { AppLogo } from '~/components/app-logo';

export function AuthShell({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const centerLogo = pathname === '/auth/sign-up';

  function AuthLogo({ className }: { className?: string }) {
    if (!centerLogo) {
      return <AppLogo className={className} />;
    }

    return (
      <div className="flex w-full max-w-[23rem] justify-center px-6 md:w-8/12 md:px-8 lg:w-5/12 lg:px-8 xl:w-4/12">
        <AppLogo className={cn(className, 'object-center')} />
      </div>
    );
  }

  return <AuthLayoutShell Logo={AuthLogo}>{children}</AuthLayoutShell>;
}

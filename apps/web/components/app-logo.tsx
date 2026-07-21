"use client";
import Link from 'next/link';

import { cn } from '@kit/ui/utils';
import appConfig from '~/config/app.config';
import Image from 'next/image';
import { useSidebar } from '@kit/ui/shadcn-sidebar';

const logo = {
  width: 640,
  height: 321,
  src: '/images/logo/primary-logo.png',
  src_short: '/images/logo/short-logo.png',
};

function LogoImage({
  className,
  width = logo.width,
  height = logo.height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) {
  const {open} = useSidebar();
  if (!open) {
    return (
      <Image
        alt={appConfig.name}
        className={cn(
          'h-10 w-auto max-w-[min(100%,220px)] object-contain object-left sm:h-10 lg:h-14 xl:h-16',
          className,
        )}
        height={height}
        priority
        src={logo.src_short}
        width={width}
      />
    );
  }
  return (
    <Image
      alt={appConfig.name}
      className={cn(
        'h-10 w-auto max-w-[min(100%,220px)] object-contain object-left sm:h-10 lg:h-14 xl:h-16',
        className,
      )}
      height={height}
      priority
      src={logo.src}
      width={width}
    />
  );
}

export function AppLogo({
  href,
  label,
  className,
}: {
  href?: string | null;
  className?: string;
  label?: string;
}) {
  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
}

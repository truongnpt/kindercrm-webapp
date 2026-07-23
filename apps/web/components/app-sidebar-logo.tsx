"use client";
import Link from 'next/link';

import { cn } from '@kit/ui/utils';
import appConfig from '~/config/app.config';
import Image from 'next/image';
import { useSidebar } from '@kit/ui/shadcn-sidebar';
import { School } from '@/lib/kinder/types';

export const logo = {
  width: 640,
  height: 321,
  src: '/images/logo/primary-logo.png',
  src_short: '/images/logo/short-logo.png',
};

function LogoImage({
  className,
  width = logo.width,
  height = logo.height,
  icon = false,
}: {
  className?: string;
  width?: number;
  height?: number;
  icon?: boolean;
}) {
  const {open} = useSidebar();

  if (icon) {
    return (
      <Image
        alt={appConfig.name}
        className={cn(
          'h-10 w-10 object-contain object-center',
          className,
        )}
        height={50}
        priority
        src={logo.src_short}
        width={50}
      />
    );
  }
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

export function SchoolImage ({school, className}: {school: School, className?: string}) {
  if (!school.logo_url) {
    return null;
  }
  return (
    <Image
        alt={school.name}
        className={cn(
          'h-10 w-10 object-contain object-center',
          className,
        )}
        height={50}
        priority
        src={school.logo_url}
        width={50}
      />
  )
}

export function AppSidebarLogo({
  href,
  label,
  className,
  onlyIcon = false,
  onlyTitle = false,
  school
}: {
  href?: string | null;
  className?: string;
  label?: string;
  onlyIcon?: boolean;
  onlyTitle?: boolean;
  school?: School;
}) {
  if (onlyIcon) {
    return school && school.logo_url ? <SchoolImage school={school} /> : <LogoImage icon />;
  }

  if (onlyTitle) {
    return <span className='truncate text-primary text-2xl font-medium'>{school?.name || appConfig.name}</span>;
  }

  if (href === null) {
    return <LogoImage className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <LogoImage className={className} />
    </Link>
  );
}

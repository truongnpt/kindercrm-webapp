'use client';

import { User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { cn } from '@kit/ui/utils';

export function ParentChildAvatar({
  name,
  photoUrl,
  size = 'md',
  className,
}: {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClass = {
    sm: 'size-10 text-sm',
    md: 'size-12 text-base',
    lg: 'size-16 text-lg',
    xl: 'size-20 text-xl',
  }[size];

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Avatar
      className={cn(
        sizeClass,
        'border-2 border-primary/20 bg-primary/10 font-semibold text-primary',
        className,
      )}
    >
      {photoUrl ? <AvatarImage alt={name} src={photoUrl} /> : null}
      <AvatarFallback className="bg-primary/10 text-primary">
        {initials || <User />}
      </AvatarFallback>
    </Avatar>
  );
}

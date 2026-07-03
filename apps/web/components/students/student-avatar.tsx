import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { cn } from '@kit/ui/utils';

const AVATAR_TONES = [
  'bg-primary/15 text-primary',
  'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
] as const;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]![0] ?? ''}${parts[parts.length - 1]![0] ?? ''}`.toUpperCase();
}

function toneFromName(name: string) {
  let hash = 0;

  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length]!;
}

const SIZE_CLASSES = {
  sm: 'size-8 text-[10px]',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
  xl: 'size-16 text-lg',
} as const;

export function StudentAvatar({
  name,
  photoUrl,
  size = 'md',
  className,
  fallbackClassName,
}: {
  name: string;
  photoUrl?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar
      className={cn(
        'shrink-0 rounded-full',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {photoUrl ? <AvatarImage alt={name} src={photoUrl} /> : null}
      <AvatarFallback
        className={cn(
          'rounded-full font-semibold',
          fallbackClassName ?? toneFromName(name),
        )}
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

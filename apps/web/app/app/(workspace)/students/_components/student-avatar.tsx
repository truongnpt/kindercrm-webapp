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

export function StudentAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClass =
    size === 'sm' ? 'size-8 text-[10px]'
    : size === 'lg' ? 'size-12 text-sm'
    : size === 'xl' ? 'size-16 text-lg'
    : 'size-10 text-xs';

  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold',
        sizeClass,
        toneFromName(name),
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}

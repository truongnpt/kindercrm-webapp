import type { CommunicationChannel } from '~/lib/kinder/communication/types';

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`.toUpperCase();
}

export function formatMessageTimestamp(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatThreadTimestamp(
  iso: string | null,
  labels?: { yesterday: string },
) {
  if (!iso) {
    return '';
  }

  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (dayDiff === 1) {
    return labels?.yesterday ?? 'Yesterday';
  }

  if (dayDiff < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDaySeparator(
  iso: string,
  labels: { today: string; yesterday: string },
) {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return labels.today;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return labels.yesterday;
  }

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function dayKey(iso: string) {
  const date = new Date(iso);

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export const CHANNEL_STYLES: Record<
  CommunicationChannel,
  { className: string; avatarClassName: string }
> = {
  homeroom: {
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    avatarClassName: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  },
  school_office: {
    className: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    avatarClassName: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  },
};

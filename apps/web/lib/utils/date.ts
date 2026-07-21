import moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

export function formatDate(
    value?: string | Date | null,
    format: string = DATE_FORMAT,
): string {
    if (!value) {
        return '-';
    }

    const date = moment(value);

    return date.isValid() ? date.format(format) : '-';
}

export function formatDateTime(
    value?: string | Date | null,
): string {
    return formatDate(value, DATETIME_FORMAT);
}

export function formatTime(
    value?: string | Date | null,
): string {
    return formatDate(value, TIME_FORMAT);
}

export function formatRelativeTime(
    value?: string | Date | null,
): string {
    if (!value) {
        return '-';
    }

    const date = moment(value);

    return date.isValid() ? date.fromNow() : '-';
}

export function formatBirthday(
    value?: string | Date | null,
): string {
    return formatDate(value, 'DD/MM/YYYY');
}

export function formatMonthYear(
    value?: string | Date | null,
): string {
    return formatDate(value, 'MM/YYYY');
}

export function formatYear(
    value?: string | Date | null,
): string {
    return formatDate(value, 'YYYY');
}

export function formatISO(
    value?: string | Date | null,
): string {
    if (!value) {
        return '';
    }

    const date = moment(value);

    return date.isValid() ? date.toISOString() : '';
}

export function isExpired(
    value?: string | Date | null,
): boolean {
    if (!value) {
        return false;
    }

    return moment(value).isBefore(moment(), 'day');
}

export function isToday(
    value?: string | Date | null,
): boolean {
    if (!value) {
        return false;
    }

    return moment(value).isSame(moment(), 'day');
}

export function diffDays(
    start?: string | Date | null,
    end?: string | Date | null,
): number {
    if (!start || !end) {
        return 0;
    }

    return moment(end).diff(moment(start), 'days');
}
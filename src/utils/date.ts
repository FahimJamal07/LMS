import { differenceInCalendarDays, format, formatDistanceToNowStrict, parseISO } from 'date-fns';

export function formatDate(value: string) {
  return format(parseISO(value), 'dd MMM yyyy');
}

export function formatShortDate(value: string) {
  return format(parseISO(value), 'dd MMM');
}

export function formatRelative(value: string) {
  return formatDistanceToNowStrict(parseISO(value), { addSuffix: true });
}

export function getLeaveDays(startDate: string, endDate: string) {
  return Math.max(1, differenceInCalendarDays(parseISO(endDate), parseISO(startDate)) + 1);
}

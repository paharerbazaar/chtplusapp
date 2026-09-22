import dayjs from 'dayjs';

export function formatTaka(amount: number | string | null | undefined): string {
  const n = Number(amount || 0);
  return `৳${n.toLocaleString('en-US')}`;
}

export function formatDate(value?: string | null): string {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('D MMM YYYY') : String(value);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '';
  const d = dayjs(value);
  return d.isValid() ? d.format('D MMM YYYY, h:mm A') : String(value);
}

export function formatRelativeShort(value?: string | null): string {
  if (!value) return '';
  const d = dayjs(value);
  if (!d.isValid()) return '';
  const diffMin = dayjs().diff(d, 'minute');
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = dayjs().diff(d, 'hour');
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = dayjs().diff(d, 'day');
  if (diffDay < 7) return `${diffDay}d`;
  return d.format('D MMM');
}

export function timeRange(start?: string | null, end?: string | null): string {
  if (!start || !end) return '';
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`;
}

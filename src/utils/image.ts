import { API_BASE_URL } from '@/constants/config';

// API responses hand back relative paths like "/uploads/users/xyz.jpg";
// this is the one place that turns those into loadable URLs.
export function resolveImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

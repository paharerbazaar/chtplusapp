// Maps a web path (as stored in a notification's `link`, or a OneSignal push's
// launch URL) to an in-app screen + params. Covers every pattern actually
// produced by lib/notify.js / lib/push.js call sites in the backend. Returns
// null for anything unrecognized, so the caller can fall back to doing
// nothing rather than guessing.
export type DeepLinkTarget = { screen: string; params?: Record<string, unknown> };

export function resolveDeepLinkPath(rawPath: string): DeepLinkTarget | null {
  let path = rawPath;
  try {
    // Accept a full https://chtplus.xyz/... URL as well as a bare path.
    if (/^https?:\/\//i.test(path)) path = new URL(path).pathname + new URL(path).search;
  } catch {
    // not a valid absolute URL — treat as already a path
  }

  const [pathname, query] = path.split('?');
  const params = new URLSearchParams(query || '');
  const openId = params.get('open');

  if (pathname === '/my-appointments') return { screen: 'MyAppointments' };
  if (pathname === '/coins') return { screen: 'MainTabs', params: { screen: 'Wallet' } };
  if (pathname === '/my-services') return { screen: 'MyServices' };
  if (pathname === '/donors' && openId) return { screen: 'DonorDetail', params: { id: openId } };
  if (pathname === '/biodata' && openId) return { screen: 'BiodataDetail', params: { id: openId } };
  if (pathname === '/services' && openId) return { screen: 'ServiceDetail', params: { id: openId } };
  if (pathname === '/marketplace' && openId) return { screen: 'ListingDetail', params: { id: openId } };

  let m = pathname.match(/^\/u\/([^/]+)$/);
  if (m) return { screen: 'PublicProfile', params: { id: m[1] } };

  m = pathname.match(/^\/marketplace\/listing\/([^/]+)$/);
  if (m) return { screen: 'ListingDetail', params: { id: m[1] } };

  m = pathname.match(/^\/services\/([^/]+)$/);
  if (m) return { screen: 'ServiceDetail', params: { id: m[1] } };

  m = pathname.match(/^\/donors\/([^/]+)$/);
  if (m) return { screen: 'DonorDetail', params: { id: m[1] } };

  m = pathname.match(/^\/doctors\/([^/]+)$/);
  if (m) return { screen: 'DoctorDetail', params: { id: m[1] } };

  m = pathname.match(/^\/biodata\/([^/]+)$/);
  if (m) return { screen: 'BiodataDetail', params: { id: m[1] } };

  // /chat/:conversationId — the web route only has the id, not the other
  // user's name/photo the RN Conversation screen wants, so this opens the
  // inbox instead of guessing those.
  if (/^\/chat\//.test(pathname)) return { screen: 'MainTabs', params: { screen: 'Chat' } };

  return null;
}

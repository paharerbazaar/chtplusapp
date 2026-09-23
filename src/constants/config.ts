// Single place to change the backend origin. https://chtplus.xyz is the live
// khagrachariPlusNackend deployment. For local development, point the app at a
// backend on your machine with EXPO_PUBLIC_API_BASE_URL in .env.local
// (gitignored), e.g. EXPO_PUBLIC_API_BASE_URL=http://192.168.1.6:3000
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://chtplus.xyz';
export const API_URL = `${API_BASE_URL}/api`;

export const CHAT_POLL_INTERVAL_MS = 4000;
export const CHAT_LIST_POLL_INTERVAL_MS = 15000;

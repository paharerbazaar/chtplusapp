// Colors lifted from the web app's public/manifest.json so the app feels
// like the same product as chtplus.xyz.
export const colors = {
  primary: '#145c39',
  primaryDark: '#0e4227',
  primaryLight: '#e3f0e9',
  background: '#f4f6f5',
  surface: '#ffffff',
  text: '#1a1f1c',
  textMuted: '#6b7770',
  border: '#e1e6e3',
  danger: '#c0392b',
  warning: '#b8860b',
  success: '#1e8449',
  gold: '#c99a2e',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 19, fontWeight: '700' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14.5, fontWeight: '400' as const },
  small: { fontSize: 12.5, fontWeight: '400' as const },
};

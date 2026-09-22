import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToPath(screen: string, params?: Record<string, unknown>) {
  if (!navigationRef.isReady()) return;
  (navigationRef as unknown as { navigate: (screen: string, params?: unknown) => void }).navigate(screen, params);
}

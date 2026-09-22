import { useEffect, useRef } from 'react';
import { OneSignal, type NotificationClickEvent } from 'react-native-onesignal';
import { useQuery } from '@tanstack/react-query';
import { getAppConfig } from '@/api/misc';
import { useAuth } from '@/auth/AuthContext';
import { resolveDeepLinkPath } from '@/utils/deepLink';
import { navigateToPath } from '@/navigation/navigationRef';

// Wires up react-native-onesignal exactly the way the web client does
// (OneSignal.login(userId) sets the "external_id" the backend's lib/push.js
// already targets — see app/OneSignalInit.js on the web side), and maps a
// tapped notification's launch URL back to an in-app screen instead of
// letting OneSignal open it as a web link.
export function usePushNotifications() {
  const { data: config } = useQuery({ queryKey: ['app-config'], queryFn: getAppConfig, staleTime: Infinity });
  const { user, isAuthenticated } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!config?.oneSignalAppId || initialized.current) return;
    initialized.current = true;
    OneSignal.initialize(config.oneSignalAppId);
    OneSignal.Notifications.requestPermission(false);

    OneSignal.Notifications.addEventListener('click', (event: NotificationClickEvent) => {
      const path = event.result?.url || event.notification?.launchURL;
      if (!path) return;
      const target = resolveDeepLinkPath(path);
      if (target) navigateToPath(target.screen, target.params);
    });
  }, [config?.oneSignalAppId]);

  useEffect(() => {
    if (!initialized.current) return;
    if (isAuthenticated && user) {
      OneSignal.login(user.id);
    } else {
      OneSignal.logout();
    }
  }, [isAuthenticated, user]);
}

import { useEffect, useState, useCallback } from 'react';
import { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { useQuery } from '@tanstack/react-query';
import { getAppConfig } from '@/api/misc';

// The backend verifies the Google ID token's audience against the single
// "google_client_id" configured in Admin -> Settings (see lib/googleAuth.js).
// GoogleSignin.configure's webClientId must be that exact same client id for
// the native sign-in's idToken to pass that check, so it's fetched from
// /api/app-config rather than hardcoded.
export function useGoogleAuth() {
  const { data } = useQuery({ queryKey: ['app-config'], queryFn: getAppConfig, staleTime: Infinity });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (data?.googleClientId) {
      GoogleSignin.configure({ webClientId: data.googleClientId, offlineAccess: false });
      setReady(true);
    }
  }, [data?.googleClientId]);

  const signIn = useCallback(async (): Promise<string | null> => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      return response.data.idToken;
    }
    return null;
  }, []);

  const isCancelled = useCallback((err: unknown) => isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED, []);

  return { ready, signIn, isCancelled };
}

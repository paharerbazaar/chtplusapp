import axios, { AxiosError } from 'axios';
import { API_URL } from '@/constants/config';
import { getToken } from '@/lib/tokenStorage';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Set by AuthContext on mount, so a 401 anywhere (an expired/invalid token)
// clears the session and drops the user back to the login screen.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response?.status === 401) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

// Every backend error is `{ error: 'some_code' }` — this pulls that code out,
// or falls back to a generic one for network failures/timeouts.
export function apiErrorCode(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const code = (error.response?.data as { error?: string } | undefined)?.error;
    if (code) return code;
    if (error.code === 'ECONNABORTED') return 'timeout';
    if (!error.response) return 'network_error';
  }
  return 'unknown_error';
}

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: 'Please log in again.',
  invalid_credentials: 'Incorrect email or password.',
  email_taken: 'An account with this email already exists.',
  invalid_input: 'Please check the information you entered.',
  invalid_body: 'Something went wrong sending that. Please try again.',
  not_found: 'Not found.',
  insufficient_coins: "You don't have enough coins for this.",
  chat_disabled: 'This user has turned off chat.',
  date_unavailable: 'That date is no longer available. Please pick another.',
  network_error: 'Could not reach the server. Check your internet connection.',
  timeout: 'The server took too long to respond. Please try again.',
  google_not_configured: 'Google sign-in is not available right now.',
  invalid_google_token: 'Google sign-in failed. Please try again.',
  email_not_verified: 'Your Google email is not verified.',
};

export function apiErrorMessage(error: unknown): string {
  const code = apiErrorCode(error);
  if (axios.isAxiosError(error) && typeof error.response?.data?.error === 'string' && error.response.data.error.includes(' ')) {
    // Some endpoints (biodata validation) return a human-readable sentence
    // instead of a short code — pass those through as-is.
    return error.response.data.error;
  }
  return ERROR_MESSAGES[code] || 'Something went wrong. Please try again.';
}

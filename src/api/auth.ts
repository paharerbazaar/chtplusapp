import { api } from './client';
import type { User } from '@/types';

export interface AuthResponse {
  token: string;
  user: User;
}

export function login(email: string, password: string) {
  return api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data);
}

export function register(input: { name: string; email: string; password: string; phone?: string; area?: string }) {
  return api.post<AuthResponse>('/auth/register', input).then((r) => r.data);
}

export function loginWithGoogle(credential: string) {
  return api.post<AuthResponse>('/auth/google', { credential }).then((r) => r.data);
}

export function requestPasswordReset(email: string) {
  return api.post<{ ok: true }>('/auth/forgot-password', { email }).then((r) => r.data);
}

export function resetPassword(input: { email: string; code: string; newPassword: string }) {
  return api.post<AuthResponse>('/auth/reset-password', input).then((r) => r.data);
}

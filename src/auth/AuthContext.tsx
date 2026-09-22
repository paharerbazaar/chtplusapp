import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  loginWithGoogle as apiLoginWithGoogle,
  resetPassword as apiResetPassword,
} from '@/api/auth';
import { getMe } from '@/api/me';
import { getToken, setToken, clearToken } from '@/lib/tokenStorage';
import { setUnauthorizedHandler } from '@/api/client';
import type { MeResponse, User } from '@/types';

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  me: MeResponse | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; phone?: string; area?: string }) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  resetPassword: (input: { email: string; code: string; newPassword: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);

  const refreshMe = useCallback(async () => {
    try {
      const data = await getMe();
      setMe(data);
      setUser((prev) => (prev ? { ...prev, ...data.user } : (data.user as unknown as User)));
    } catch {
      // Leave the cached user in place; whatever screen triggered this can
      // surface its own error.
    }
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
    setMe(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const data = await getMe();
          setMe(data);
          setUser(data.user as unknown as User);
        } catch {
          await clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    await setToken(res.token);
    setUser(res.user);
    await refreshMe();
  }, [refreshMe]);

  const register = useCallback(
    async (input: { name: string; email: string; password: string; phone?: string; area?: string }) => {
      const res = await apiRegister(input);
      await setToken(res.token);
      setUser(res.user);
      await refreshMe();
    },
    [refreshMe]
  );

  const loginWithGoogle = useCallback(
    async (credential: string) => {
      const res = await apiLoginWithGoogle(credential);
      await setToken(res.token);
      setUser(res.user);
      await refreshMe();
    },
    [refreshMe]
  );

  const resetPassword = useCallback(
    async (input: { email: string; code: string; newPassword: string }) => {
      const res = await apiResetPassword(input);
      await setToken(res.token);
      setUser(res.user);
      await refreshMe();
    },
    [refreshMe]
  );

  const value = useMemo<AuthContextValue>(
    () => ({ isLoading, isAuthenticated: !!user, user, me, login, register, loginWithGoogle, resetPassword, logout, refreshMe }),
    [isLoading, user, me, login, register, loginWithGoogle, resetPassword, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

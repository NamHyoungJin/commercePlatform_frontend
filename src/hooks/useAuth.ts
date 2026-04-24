'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi, LoginPayload, RegisterPayload } from '@/lib/authApi';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';
export function useAuth() {
  const router = useRouter();
  const { member, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (payload: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authApi.login(payload);
      setAuth(data.member, data.access);
      return {
        success: true as const,
        identityVerificationWarning: data.identity_verification_warning ?? null,
      };
    } catch (err: any) {
      const raw = err.response?.data;
      const msg = raw ? formatApiErrorMessage(raw) : '로그인에 실패했습니다.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  const register = async (payload: RegisterPayload) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await authApi.register(payload);
      return { success: true, data };
    } catch (err: any) {
      const raw = err.response?.data;
      const msg = raw ? formatApiErrorMessage(raw) : '회원가입에 실패했습니다.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  return { member, isAuthenticated, loading, error, login, logout, register };
}

'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/authApi';
import { tokenUtils } from '@/lib/tokenUtils';
import { unwrapOnlyonemusicBody } from '@/lib/onlyonemusicApi';

/** 새로고침 후에도 로그인 유지: 쿠키 액세스 또는 리프레시 쿠키로 `/auth/me/` 복원 */
async function ensureAccessToken(): Promise<string | null> {
  const existing = tokenUtils.getAccess();
  if (existing) return existing;

  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  if (!base) return null;

  try {
    const { data } = await axios.post(
      `${base}/auth/token/refresh/`,
      {},
      { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
    );
    const unwrapped = unwrapOnlyonemusicBody<{ access?: string }>(data);
    const access = unwrapped.access;
    if (access) {
      tokenUtils.setAccess(access);
      return access;
    }
  } catch {
    /* 세션 없음 */
  }
  return null;
}

export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAuthReady = useAuthStore((s) => s.setAuthReady);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const access = await ensureAccessToken();
        if (cancelled) return;

        if (access) {
          try {
            const { data: member } = await authApi.me();
            if (!cancelled) setAuth(member, access);
          } catch {
            if (!cancelled) clearAuth();
          }
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setAuth, clearAuth, setAuthReady]);

  return <>{children}</>;
}

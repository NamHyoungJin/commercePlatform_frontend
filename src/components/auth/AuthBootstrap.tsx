'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/authApi';
import { tokenUtils } from '@/lib/tokenUtils';
import { refreshAccessTokenSingleton } from '@/lib/refreshAccessTokenSingleton';

/** 새로고침 후에도 로그인 유지: 액세스 쿠키 또는 리프레시 쿠키(axios 인터셉터와 동일 경로로 직렬화) */
async function ensureAccessToken(): Promise<string | null> {
  const existing = tokenUtils.getAccess();
  if (existing) return existing;

  try {
    return await refreshAccessTokenSingleton();
  } catch {
    return null;
  }
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

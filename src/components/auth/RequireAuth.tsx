'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const authReady = useAuthStore((s) => s.authReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!authReady || isAuthenticated) return;
    const next = encodeURIComponent(pathname);
    router.replace(`/login?next=${next}`);
  }, [authReady, isAuthenticated, pathname, router]);

  if (!authReady) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-sm text-neutral-500">세션 확인 중…</div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-sm text-neutral-500">로그인 페이지로 이동합니다…</div>
    );
  }

  return <>{children}</>;
}

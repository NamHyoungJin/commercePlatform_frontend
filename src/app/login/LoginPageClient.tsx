'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoginForm from '@/components/auth/LoginForm';

const REDIRECT_MS = 1800;

export default function LoginPageClient() {
  const router = useRouter();
  const authReady = useAuthStore((s) => s.authReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const redirected = useRef(false);

  /** AuthBootstrap 직후 1회만: 들어올 때부터 로그인됐는지(폼 제출로 인한 로그인과 구분) */
  const [wasLoggedInOnLoad, setWasLoggedInOnLoad] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authReady || wasLoggedInOnLoad !== null) return;
    setWasLoggedInOnLoad(isAuthenticated);
  }, [authReady, isAuthenticated, wasLoggedInOnLoad]);

  useEffect(() => {
    if (!authReady || wasLoggedInOnLoad !== true || redirected.current) return;
    redirected.current = true;

    const t = window.setTimeout(() => {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.replace('/');
      }
    }, REDIRECT_MS);

    return () => window.clearTimeout(t);
  }, [authReady, wasLoggedInOnLoad, router]);

  if (authReady && wasLoggedInOnLoad === true) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-[var(--background)] px-4 py-16 text-center">
        <p className="text-lg text-neutral-200">이미 로그인되어 있습니다.</p>
        <p className="max-w-md text-sm text-neutral-500">
          잠시 후 이전 페이지로 돌아갑니다. 바로 이동하려면 아래 버튼을 눌러 주세요.
        </p>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          className="rounded-full border border-neutral-600 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          지금 돌아가기
        </button>
      </div>
    );
  }

  if (!authReady || wasLoggedInOnLoad === null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[var(--background)] px-4 py-16">
        <p className="text-sm text-neutral-500">세션 확인 중…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section
        className="relative hidden min-h-[270px] items-center justify-center border-b border-white/[0.06] bg-[#0c0c0c] bg-cover bg-center bg-no-repeat md:flex"
        style={{ backgroundImage: "url('/img/_common/whoOnlyonemusic.png')" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-black/35" aria-hidden />
        <h1 className="relative z-10 mx-auto w-full max-w-pc px-4 text-center home-album-strip-title sm:px-6">
          login
        </h1>
      </section>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-[var(--background)] px-4 py-8 sm:px-6">
        <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl shadow-black/40 ring-1 ring-black/[0.06]">
          <Suspense fallback={<p className="text-center text-sm text-neutral-500">로딩 중…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

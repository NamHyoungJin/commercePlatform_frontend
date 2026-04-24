'use client';

import Image from 'next/image';
import Link from '@/components/AppLink';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

/** 고객센터 `CustomerCenterShell` 히어로 탭과 동일 톤 */
const tabBase =
  'inline-flex min-h-[2.5rem] max-w-full items-center justify-center rounded-full border px-3 py-1.5 text-center text-[12px] font-medium leading-snug transition sm:min-h-[2.75rem] sm:px-3.5 sm:text-[13px] md:text-sm';

const tabInactive =
  `${tabBase} border-white/25 bg-white/5 text-white/90 hover:border-white/45 hover:bg-white/12 hover:!text-white`;

const tabActive = `${tabBase} border-[#2ca7e1] bg-[#2ca7e1] text-white shadow-md shadow-black/25 hover:!text-white hover:bg-[#2496cc] hover:border-[#2496cc]`;

type NavLink = { href: string; label: string; guestOnly?: boolean; authOnly?: boolean };

const LINKS: NavLink[] = [
  { href: '/mypage', label: '마이페이지 홈', authOnly: true },
  { href: '/membership/member/modify', label: '회원정보 수정', authOnly: true },
  { href: '/mypage/wish', label: '보관함', authOnly: true },
  { href: '/mypage/cart2', label: '장바구니', authOnly: true },
  { href: '/mypage/printdown', label: '인쇄 / 다운로드', authOnly: true },
];

export default function MypageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const visible = LINKS.filter((l) => {
    if (l.authOnly && !isAuthenticated) return false;
    if (l.guestOnly && isAuthenticated) return false;
    return true;
  });

  return (
    <div className="min-h-[50vh] bg-[var(--background)] text-text-secondary">
      <section className="relative isolate min-h-[270px] overflow-hidden border-b border-[var(--border-subtle)]">
        <Image
          src="/img/_common/bass-622598.jpg"
          alt=""
          fill
          className="object-cover object-[22%_center]"
          sizes="(min-width: 1440px) 1440px, 100vw"
          priority
        />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/50" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-transparent to-black/40"
          aria-hidden
        />
        {/* 제목·부제는 세로로만 쌓고, 탭은 하단 — 중앙 absolute 제목과 하단 부제·탭이 모바일에서 겹치지 않게 함 (고객센터 히어로와 동일) */}
        <div className="relative z-10 mx-auto flex min-h-[270px] max-w-pc flex-col px-4 pb-5 pt-8 text-center text-white sm:px-6 sm:pb-6 sm:pt-10 md:pb-7">
          <div className="hero-media-on-dark flex min-h-0 flex-1 flex-col items-center justify-center gap-2 pb-3 sm:gap-2.5 sm:pb-4 md:gap-3">
            <h1 className="pointer-events-none w-full max-w-pc shrink-0">
              <span className="home-album-strip-title popular-chart-section-title inline-block text-balance">{title}</span>
            </h1>
            {subtitle ? (
              <p className="home-album-strip-sub popular-chart-section-sub mx-auto max-w-4xl shrink-0 text-balance">
                {subtitle}
              </p>
            ) : null}
          </div>
          <div className="hero-media-on-dark shrink-0">
            <nav
              className={`w-full ${subtitle ? 'mt-3 md:mt-4' : 'mt-2 md:mt-3'}`}
              aria-label="마이페이지 메뉴"
            >
              <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {visible.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href} className="min-w-0">
                      <Link href={item.href} className={active ? tabActive : tabInactive}>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border-subtle)] py-10 sm:py-14 md:py-16">
        <div className="mx-auto max-w-pc px-4 sm:px-6">
          <div className="min-w-0 rounded-2xl border border-[var(--border-strong)] bg-surface p-6 shadow-md shadow-neutral-900/[0.06] sm:p-8">
            {children}
          </div>
        </div>
      </section>
    </div>
  );
}

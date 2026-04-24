import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

/** 히어로(어두운 오버레이) 위 가로 탭 */
const tabBase =
  'inline-flex min-h-[2.5rem] max-w-full items-center justify-center rounded-full border px-3 py-1.5 text-center text-[12px] font-medium leading-snug transition sm:min-h-[2.75rem] sm:px-3.5 sm:text-[13px] md:text-sm';

const tabInactive =
  `${tabBase} border-white/25 bg-white/5 text-white/90 hover:border-white/45 hover:bg-white/12 hover:!text-white`;

const tabActive = `${tabBase} border-[#2ca7e1] bg-[#2ca7e1] text-white shadow-md shadow-black/25 hover:!text-white hover:bg-[#2496cc] hover:border-[#2496cc]`;

const NAV = [
  { key: 'notice' as const, href: '/customer/notice', label: '공지사항' },
  { key: 'faq' as const, href: '/customer/faq', label: '자주 묻는 질문 (FAQ)' },
  { key: 'qna' as const, href: '/customer/qna', label: '묻고 답하기 (QNA)' },
  { key: 'terms' as const, href: '/customer/terms', label: '이용약관' },
  { key: 'privacy' as const, href: '/customer/privacy', label: '개인정보취급방침' },
];

export type CustomerCenterKey = (typeof NAV)[number]['key'];

/** 고객센터 — 히어로 배경 + 제목·부제 + 상단 가로 탭, 본문 전체 폭 */
export default function CustomerCenterShell({
  titleKo,
  subtitleEn,
  activeKey,
  children,
}: {
  titleKo: string;
  subtitleEn: string;
  activeKey: CustomerCenterKey;
  children?: ReactNode;
}) {
  return (
    <div className="min-h-[50vh] bg-[var(--background)] text-text-secondary">
      {/* `/scores` 히어로와 동일 최소 높이 `min-h-[270px]` */}
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
        {/* 제목·부제는 세로로만 쌓고, 탭은 하단 — 절대배치 중앙 제목과 하단 블록이 모바일에서 겹치지 않게 함 */}
        <div className="relative z-10 mx-auto flex min-h-[270px] max-w-pc flex-col px-4 pb-5 pt-8 text-center text-white sm:px-6 sm:pb-6 sm:pt-10 md:pb-7">
          <div className="hero-media-on-dark flex min-h-0 flex-1 flex-col items-center justify-center gap-2 pb-3 sm:gap-2.5 sm:pb-4 md:gap-3">
            <h1 className="pointer-events-none w-full max-w-pc shrink-0">
              <span className="home-album-strip-title popular-chart-section-title inline-block text-balance">
                {titleKo}
              </span>
            </h1>
            <p className="home-album-strip-sub popular-chart-section-sub mx-auto max-w-4xl shrink-0 text-balance">
              {subtitleEn}
            </p>
          </div>
          {/* 루트 `a:hover { color: inherit }`가 li→ancestor의 text-secondary를 타지 않도록 기본 글자색 명시 */}
          <div className="hero-media-on-dark shrink-0">
            <nav className="w-full md:mt-0" aria-label="고객센터 메뉴">
              <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {NAV.map((item) => {
                  const active = item.key === activeKey;
                  return (
                    <li key={item.key} className="min-w-0">
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

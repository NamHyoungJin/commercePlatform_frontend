'use client';

import { useEffect, useState } from 'react';
import Link from '@/components/AppLink';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { SCORE_CATEGORY_MENU, scoreCategoryHref } from '@/lib/scoreCategories';

type NavChild = { label: string; href: string };
type NavItem = { label: string; href: string; children?: NavChild[] };

const BASE_NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: '최신악보', href: '/scores?sort=newest' },
  { label: '인기악보', href: '/scores?sort=popular' },
  {
    label: '악보형식',
    href: '#',
    children: [
      { label: '단선악보', href: '/scoresType?type=SYS13A17B002' },
      { label: '피아노 연주', href: '/scoresType?type=SYS20304B001' },
      { label: '색소폰 연주', href: '/scoresType?type=SYS20313B001' },
    ],
  },
  {
    label: '카테고리',
    href: '#',
    children: SCORE_CATEGORY_MENU.map((c) => ({
      label: c.label,
      href: scoreCategoryHref(c.code),
    })),
  },
  { label: '고객센터', href: '/customer/notice' },
];

const TOP_NAV: { label: string; href: string }[] = [
  { label: '악보', href: '/scores' },
  { label: '멀티 트랙', href: '/multitrack' },
  { label: 'SHOP', href: '/shop' },
];

/** 예전 membership 메뉴 — 마이페이지 드롭다운으로 이동 (`tab`은 마이페이지에서 추후 사용 가능) */
const MYPAGE_MENU_AUTH: NavChild[] = [
  { label: '회원정보수정', href: '/membership/member/modify' },
  { label: '보관함', href: '/mypage/wish' },
  { label: '장바구니', href: '/mypage/cart2' },
  { label: '인쇄/다운로드', href: '/mypage/printdown' },
];

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="flex h-5 w-6 flex-col justify-center gap-1" aria-hidden>
      <span
        className={`block h-0.5 rounded-full bg-current transition-transform ${
          open ? 'translate-y-1.5 rotate-45' : ''
        }`}
      />
      <span className={`block h-0.5 rounded-full bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
      <span
        className={`block h-0.5 rounded-full bg-current transition-transform ${
          open ? '-translate-y-1.5 -rotate-45' : ''
        }`}
      />
    </span>
  );
}

export default function Header() {
  const { member, isAuthenticated, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMypageMenu, setOpenMypageMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileNavExpanded, setMobileNavExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) setMobileNavExpanded(null);
  }, [mobileMenuOpen]);

  const topLinkClass =
    'rounded px-1 py-0 text-[12px] font-semibold leading-none tracking-wide text-text-secondary transition-colors hover:text-[#2ca7e1] sm:text-[13px]';

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div className="border-b border-[var(--border-subtle)] bg-surface-muted/90">
        <div className="mx-auto flex max-w-pc items-center justify-end px-4 py-0.5 sm:px-6">
          <nav className="flex flex-wrap items-center justify-end gap-x-2 gap-y-0.5" aria-label="상단 메뉴">
            {TOP_NAV.map((item, index) => (
              <span key={item.href} className="inline-flex items-center gap-x-2">
                {index > 0 ? (
                  <span className="select-none text-text-muted/70" aria-hidden>
                    |
                  </span>
                ) : null}
                <Link href={item.href} className={topLinkClass}>
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-b border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--surface)_94%,transparent)] backdrop-blur-md">
        <div className="mx-auto max-w-pc px-4 py-3.5 sm:px-6">
          <div className="relative flex min-h-[52px] w-full items-center justify-between gap-3 lg:min-h-0 lg:gap-4">
            <button
              type="button"
              className="absolute right-0 top-1/2 z-[1] -translate-y-1/2 rounded-lg p-2 text-text-primary transition-colors hover:bg-black/[0.06] lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-gnb-panel"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              <span className="sr-only">{mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}</span>
              <HamburgerIcon open={mobileMenuOpen} />
            </button>

            <div className="flex min-w-0 flex-1 justify-start pr-12 sm:pr-14 lg:flex-none lg:justify-start lg:pr-0">
              <Link
                href="/"
                className="group shrink-0 rounded-lg bg-transparent py-1.5 pl-0 pr-2.5 transition hover:opacity-90 lg:px-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Image
                  src="/img/_common/logo.png"
                  alt="ONLY ONE MUSIC score"
                  width={280}
                  height={71}
                  className="h-11 w-auto max-w-[200px] object-contain object-left contrast-[1.06] saturate-[1.12] sm:h-12 sm:max-w-[248px] md:h-[3.25rem] md:max-w-[300px]"
                  priority
                  unoptimized
                />
              </Link>
            </div>

            <nav className="hidden flex-1 flex-wrap items-center justify-center gap-1 text-[15px] font-semibold lg:flex">
              {BASE_NAV.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`group block rounded-md px-3.5 py-2.5 text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary ${
                      openDropdown === item.label ? 'bg-black/[0.04] text-text-primary' : ''
                    }`}
                  >
                    {item.label}
                    {item.children ? (
                      <span className="ml-0.5 text-xs font-bold text-text-muted transition-colors group-hover:text-text-primary">
                        ▾
                      </span>
                    ) : null}
                  </Link>
                  {item.children && openDropdown === item.label && (
                    <ul className="absolute left-0 top-full z-50 mt-0.5 min-w-[200px] rounded-lg border border-[var(--border-subtle)] bg-surface py-1 shadow-lg shadow-neutral-900/10 ring-1 ring-black/[0.04]">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            className="block px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                            onClick={() => setOpenDropdown(null)}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </nav>

            <div className="hidden shrink-0 flex-wrap items-center gap-1 sm:gap-3 lg:flex lg:translate-y-0">
              {isAuthenticated ? (
            <>
              <span className="px-0.5 text-sm font-medium text-text-primary">{member?.name}님</span>
              <span className="hidden text-text-muted sm:inline" aria-hidden>
                |
              </span>
              <div
                className="relative"
                onMouseEnter={() => setOpenMypageMenu(true)}
                onMouseLeave={() => setOpenMypageMenu(false)}
              >
                <Link
                  href="/mypage"
                  className={`group inline-flex items-center gap-0.5 rounded-md px-2.5 py-1.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary ${
                    openMypageMenu ? 'bg-black/[0.04] text-text-primary' : ''
                  }`}
                >
                  마이페이지
                  <span className="text-xs font-bold text-text-muted transition-colors group-hover:text-text-primary">
                    ▾
                  </span>
                </Link>
                {openMypageMenu && (
                  <ul className="absolute right-0 top-full z-50 mt-0.5 min-w-[200px] rounded-lg border border-[var(--border-subtle)] bg-surface py-1 shadow-lg shadow-neutral-900/10 ring-1 ring-black/[0.04]">
                    <li>
                      <Link
                        href="/mypage"
                        className="block px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                        onClick={() => setOpenMypageMenu(false)}
                      >
                        마이페이지 홈
                      </Link>
                    </li>
                    {MYPAGE_MENU_AUTH.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          className="block px-4 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                          onClick={() => setOpenMypageMenu(false)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-black/[0.04] hover:text-text-primary"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-accent-teal px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-teal-hover"
              >
                회원가입
              </Link>
            </>
          )}
            </div>
          </div>
        </div>
      </div>

      {mobileMenuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/45 lg:hidden"
            aria-label="메뉴 닫기"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            id="mobile-gnb-panel"
            className="fixed inset-y-0 right-0 z-[70] flex w-[min(100%,20rem)] flex-col border-l border-[var(--border-subtle)] bg-surface shadow-xl shadow-neutral-900/15 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="주요 메뉴"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <span className="text-sm font-bold text-text-primary">메뉴</span>
              <button
                type="button"
                className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">닫기</span>
                <HamburgerIcon open />
              </button>
            </div>
            <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="모바일 내비게이션">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">회원</p>
              <ul className="space-y-0.5 border-b border-[var(--border-subtle)] pb-3">
                {isAuthenticated ? (
                  <>
                    <li className="px-3 py-2">
                      <span className="text-sm font-semibold text-text-primary">{member?.name}님</span>
                    </li>
                    <li>
                      <Link
                        href="/mypage"
                        className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        마이페이지
                      </Link>
                    </li>
                    {MYPAGE_MENU_AUTH.map((child) => (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                    <li className="px-1 pt-1">
                      <button
                        type="button"
                        className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                      >
                        로그아웃
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/login"
                        className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        로그인
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register"
                        className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-accent-teal transition-colors hover:bg-surface-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        회원가입
                      </Link>
                    </li>
                  </>
                )}
              </ul>
              <ul className="mt-3 space-y-0.5">
                {BASE_NAV.map((item) => (
                  <li key={item.label}>
                    {item.children ? (
                      <>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                          aria-expanded={mobileNavExpanded === item.label}
                          onClick={() =>
                            setMobileNavExpanded((cur) => (cur === item.label ? null : item.label))
                          }
                        >
                          {item.label}
                          <span className="text-xs text-text-muted" aria-hidden>
                            {mobileNavExpanded === item.label ? '▾' : '▸'}
                          </span>
                        </button>
                        {mobileNavExpanded === item.label ? (
                          <ul className="ml-2 border-l border-[var(--border-subtle)] pl-2">
                            {item.children.map((child) => (
                              <li key={child.label}>
                                <Link
                                  href={child.href}
                                  className="block rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                                  onClick={() => {
                                    setMobileMenuOpen(false);
                                    setMobileNavExpanded(null);
                                  }}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}

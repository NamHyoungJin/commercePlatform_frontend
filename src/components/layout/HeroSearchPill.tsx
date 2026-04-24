'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface HeroSearchPillProps {
  /** 폼 루트에 붙는 클래스 (예: `mt-12`, `mx-auto max-w-xl`) */
  className?: string;
  placeholder?: string;
  /** URL의 `q`와 동기화할 때 전달 */
  initialQuery?: string;
  /** 검색 제출 시 이동할 경로(쿼리 `q`만 붙임). 기본 `/scoresSearch` */
  submitPath?: string;
  /**
   * `dark` — 영상·이미지 히어로 위(반투명·흰 텍스트)
   * `light` — 라이트 페이지 본문 위(흰 필·틸 검색 버튼)
   */
  tone?: 'dark' | 'light';
}

const formTone: Record<'dark' | 'light', string> = {
  dark:
    'sm:border sm:border-white/20 sm:bg-black/20 sm:backdrop-blur-sm',
  light:
    'sm:border sm:border-[var(--border-strong)] sm:bg-surface sm:shadow-md sm:shadow-neutral-900/[0.06]',
};

const inputTone: Record<'dark' | 'light', string> = {
  dark:
    'rounded-full border border-white/20 bg-white/10 px-4 py-3 text-[15px] text-white outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-white/30 sm:rounded-none sm:border-0 sm:focus:ring-0',
  light:
    'rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-[15px] text-stone-900 outline-none placeholder:text-stone-500 focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/20 sm:rounded-none sm:border-0 sm:focus:ring-2 sm:focus:ring-inset sm:focus:ring-accent-teal/20',
};

const buttonTone: Record<'dark' | 'light', string> = {
  dark:
    'shrink-0 rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-slate-900 transition-colors hover:bg-slate-100 sm:rounded-none',
  light:
    'shrink-0 rounded-full bg-accent-teal px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-accent-teal-hover sm:rounded-none',
};

/**
 * 알약형 검색바 — 제출 시 `submitPath?q=…`로 이동합니다(기본 악보 검색 전용 페이지).
 */
export default function HeroSearchPill({
  className = '',
  placeholder = '곡명, 작곡가, 아티스트 검색…',
  initialQuery = '',
  submitPath = '/scoresSearch',
  tone = 'dark',
}: HeroSearchPillProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    if (t) router.push(`${submitPath}?q=${encodeURIComponent(t)}`);
  };

  return (
    <form
      onSubmit={submit}
      className={`flex max-w-xl flex-col gap-3 sm:flex-row sm:gap-0 sm:overflow-hidden sm:rounded-full ${formTone[tone]} ${className}`}
      role="search"
    >
      <input
        type="search"
        name="searchText"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className={`min-w-0 flex-1 ${inputTone[tone]}`}
      />
      <button type="submit" className={buttonTone[tone]}>
        검색
      </button>
    </form>
  );
}

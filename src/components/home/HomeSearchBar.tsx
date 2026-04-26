'use client';

import Link from '@/components/AppLink';
import { useEffect, useRef, useState } from 'react';
import HeroSearchPill from '@/components/layout/HeroSearchPill';

/** 배경 영상 재생 속도. 1 = 일반, 0.5 = 절반, 0.33 = 더 느리게. (대부분 브라우저에서 지원) */
const HERO_VIDEO_PLAYBACK_RATE = 0.33;

/**
 * 히어로 배경 영상 URL (`public/` 기준).
 * 실서버(Linux)는 경로 대소문자 일치해야 함 — 파일명이 `mainheroVideo.mp4`이면 반드시 소문자 h.
 * 여러 개면 순서 재생 후 `onEnded`로 처음으로, 한 개면 HTML `loop`로 끊김 없이 반복.
 */
const HERO_VIDEO_SOURCES = ['/mainheroVideo.mp4'] as const;

/**
 * 히어로 배경 영상 위 세로 오버레이 (위 → 아래 linear-gradient)
 *
 * 각 스톱: `rgba(R, G, B, alpha) 위치`
 * - alpha: 0 = 완전 투명, 1 = 완전 불투명 (영상이 안 보임)
 * - 하단만 더 진하게: 아래쪽 스톱(72%, 100%)의 alpha를 올리면 됨. 예: 0.78 → 0.88
 * - 상단을 더 연하게: 0% 스톱의 alpha를 내리면 됨. 예: 0.18 → 0.10
 * - 중간 전환 위치: 38%, 72% 퍼센트를 바꿔 진해지기 시작하는 높이를 조절
 */
const HERO_VIDEO_OVERLAY_GRADIENT = [
  'rgba(15, 23, 42, 0.18) 0%',   // 상단 (연함)
  'rgba(15, 23, 42, 0.38) 38%',
  'rgba(6, 10, 18, 0.86) 72%',  // 하단으로 갈수록 (이전 0.78 → 조금 진하게)
  'rgba(2, 4, 10, 0.97) 100%',  // 맨 아래 (이전 0.92 → 더 진하게)
].join(', ');

const HERO_SINGLE_CLIP = HERO_VIDEO_SOURCES.length === 1;

export default function HomeSearchBar() {
  const [heroClipIndex, setHeroClipIndex] = useState(0);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = heroVideoRef.current;
    if (!el) return;
    const applySlow = () => {
      el.muted = true;
      el.volume = 0;
      try {
        el.playbackRate = HERO_VIDEO_PLAYBACK_RATE;
      } catch {
        /* 일부 환경에서 무시될 수 있음 */
      }
    };
    applySlow();
    el.addEventListener('loadedmetadata', applySlow);
    el.play().catch(() => {});
    return () => el.removeEventListener('loadedmetadata', applySlow);
  }, [heroClipIndex]);

  return (
    <section className="relative min-h-[min(560px,85vh)] overflow-hidden border-b border-[var(--border-subtle)] lg:min-h-[min(620px,88vh)]">
      {/* 배경 영상 */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <video
          ref={heroVideoRef}
          key={HERO_VIDEO_SOURCES[heroClipIndex]}
          className="absolute inset-0 h-full w-full object-cover object-center"
          src={HERO_VIDEO_SOURCES[heroClipIndex]}
          autoPlay
          muted
          playsInline
          loop={HERO_SINGLE_CLIP}
          preload="auto"
          onEnded={
            HERO_SINGLE_CLIP
              ? undefined
              : () => setHeroClipIndex((i) => (i + 1) % HERO_VIDEO_SOURCES.length)
          }
        />
      </div>

      {/* 상단 연·하단 진 — 세로 그라데이션만 (영상 위 가독성) */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${HERO_VIDEO_OVERLAY_GRADIENT})`,
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex max-w-pc min-h-[min(520px,78vh)] flex-col justify-center px-4 py-16 sm:px-6 md:py-20 lg:py-28">
        <div className="max-w-3xl lg:max-w-4xl">
          <div className="min-w-0">
            <h1 className="text-[clamp(2rem,5.2vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-white">
              <span className="block font-semibold text-white/90">교회와 예배를 위한</span>
              <span className="mt-1 block md:mt-2">찬양 악보를 만나보세요</span>
            </h1>

            <div className="mt-8 flex flex-wrap items-baseline gap-x-5 gap-y-4 md:mt-10">
              <Link
                href="/scores?sort=newest"
                className="inline-flex items-center justify-center rounded-full border-2 border-white px-5 py-2.5 text-[15px] font-semibold tracking-wide text-white transition-colors hover:bg-white/10"
              >
                악보 둘러보기
              </Link>
              <Link
                href="/scores?sort=popular"
                className="border-b border-white/40 pb-0.5 text-base font-medium text-white/90 transition-colors hover:border-white hover:text-white md:text-lg"
              >
                인기 악보 차트
              </Link>
            </div>

            <HeroSearchPill className="mt-12" />

            <p className="mt-6 max-w-lg text-sm leading-relaxed text-neutral-400 md:text-[0.9375rem]">
              온리원뮤직 — 단선·피아노·색소폰 등 형식별 악보를 한곳에서 찾아보세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

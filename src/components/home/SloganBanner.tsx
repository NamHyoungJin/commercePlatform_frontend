'use client';

import Image from 'next/image';
import { Music } from 'lucide-react';

/**
 * 동영상 악보 위 — slogan.png, 가로 max-w-pc(1440px) 정렬
 * 좌·우 비네트 그라데이션, 텍스트는 패널 없이 산세리프 계층만
 */
export default function SloganBanner() {
  return (
    <section className="flex w-full justify-center border-b border-white/[0.06] bg-[#0a0a0c]">
      <div
        className="relative isolate w-full max-w-pc min-h-[300px] sm:min-h-[340px] md:min-h-[400px] lg:min-h-[460px] overflow-hidden"
        aria-labelledby="slogan-banner-heading"
      >
        <Image
          src="/img/_common/slogan.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="(min-width: 1440px) 1440px, 100vw"
          priority={false}
        />
        {/* 좌측 진한 그라데이션 */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[42%] max-w-[420px] bg-gradient-to-r from-black via-black/75 to-transparent sm:w-[38%] sm:max-w-[480px]"
          aria-hidden
        />
        {/* 우측 진한 그라데이션 */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-[42%] max-w-[420px] bg-gradient-to-l from-black via-black/75 to-transparent sm:w-[38%] sm:max-w-[480px]"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-[300px] items-center px-4 py-12 sm:min-h-[340px] sm:px-6 sm:py-14 md:min-h-[400px] md:py-16 lg:min-h-[460px] lg:py-20">
          <h2 id="slogan-banner-heading" className="sr-only">
            OnlyOneMusic 슬로건
          </h2>
          <div className="max-w-2xl space-y-8 text-left sm:max-w-3xl md:space-y-10 lg:space-y-11">
            <p className="flex flex-wrap items-start gap-x-3 gap-y-2 font-display text-[clamp(1.35rem,3vw,2.125rem)] font-semibold leading-[1.3] tracking-[-0.03em] text-neutral-100">
              <span className="mt-0.5 inline-flex shrink-0 text-teal-300 [&>svg]:h-[clamp(1.35rem,3vw,2rem)] [&>svg]:w-[clamp(1.35rem,3vw,2rem)]" aria-hidden>
                <Music />
              </span>
              <span className="min-w-0">
              바람이 스치듯 이어지고,
              <br />
              물결처럼 잔잔히 흐르는 음악
              </span>
            </p>
            <p className="text-[clamp(1rem,1.75vw,1.3125rem)] font-medium leading-[1.65] tracking-[0.01em] text-neutral-400">
              복잡한 준비 대신,
              <br />
              그대로 연주에 스며들 수 있도록
            </p>
            <div className="space-y-2 pt-1 md:space-y-2.5 md:pt-0">
              <p className="font-display text-[clamp(1.25rem,2.6vw,1.9375rem)] font-semibold leading-tight tracking-[-0.025em] text-neutral-100">
                OnlyOneMusic이
              </p>
              <p className="text-[clamp(1rem,1.65vw,1.25rem)] font-medium leading-relaxed tracking-[0.01em] text-neutral-400">
                그 흐름을 함께 만듭니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import LatestScoresList from '@/components/home/LatestScoresList';
import HomeSectionTitle from '@/components/home/HomeSectionTitle';
import { Clock, ShieldCheck } from 'lucide-react';
import type { Score } from '@/lib/scoresApi';

interface Props {
  latestScores: Score[];
}

/** 인기 차트 아래 · 앨범 둘러보기 위 — whoOnlyonemusic.png 배경 */
export default function WhyOnlyOneMusic({ latestScores }: Props) {
  return (
    <section className="flex w-full justify-center border-b border-white/[0.06] bg-black">
      <div className="relative isolate w-full max-w-pc min-h-[480px] overflow-hidden md:min-h-[540px] lg:min-h-[580px]">
        <Image
          src="/img/_common/whoOnlyonemusic.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="(min-width: 1440px) 1440px, 100vw"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-black/50" aria-hidden />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[38%] max-w-[380px] bg-gradient-to-r from-black via-black/70 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-[38%] max-w-[380px] bg-gradient-to-l from-black via-black/70 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 w-full px-4 py-16 sm:px-6 md:py-20 lg:py-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400 md:text-[0.9375rem] md:tracking-[0.2em]">
                Why OnlyOneMusic
              </p>
              <h2 className="flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-3xl font-semibold leading-snug text-neutral-100 md:text-4xl md:leading-snug lg:text-[clamp(1.875rem,2.5vw,2.375rem)]">
                <span className="inline-flex shrink-0 text-teal-300 [&>svg]:h-9 [&>svg]:w-9 md:[&>svg]:h-10 md:[&>svg]:w-10" aria-hidden>
                  <ShieldCheck />
                </span>
                <span className="min-w-0">정확한 악보와 빠른 검색</span>
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-neutral-400 md:space-y-5 md:text-lg md:leading-relaxed">
                <p>
                  정확도가 검증된 악보 데이터와 고도화된 검색 시스템을 기반으로, 원하는 곡을 빠르고 효율적으로 찾을 수 있는
                  환경을 제공합니다.
                </p>
                <p>
                  단선, 보컬, 악기 파트 등 다양한 형식의 악보를 체계적으로 구조화하여 제공하며, 작곡·작사 정보와
                  조(Key)까지 하나의 화면에서 통합적으로 확인할 수 있도록 설계되었습니다.
                </p>
                <p>
                  이를 통해 자료 탐색과 정리 과정에서 발생하는 불필요한 시간을 최소화하고, 콘텐츠 접근성과 활용 효율을
                  동시에 향상시킵니다. 또한 팀 단위에서 동일한 기준의 악보를 일관되게 공유할 수 있어, 협업의 정확성과 실행
                  속도를 높이는 데 기여합니다.
                </p>
                <p>
                  결과적으로, 준비 과정의 복잡성을 줄이고 운영 효율을 극대화하여 보다 안정적이고 체계적인 연주 및
                  콘텐츠 활용 환경을 제공합니다.
                </p>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-white/15 bg-black/50 p-6 shadow-2xl backdrop-blur-md md:p-8">
                <HomeSectionTitle
                  tone="dark"
                  title="방금 올라온 악보"
                  subtitle="최신 등록분을 빠르게 확인하세요."
                  icon={<Clock />}
                />
                <LatestScoresList scores={latestScores} theme="dark" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

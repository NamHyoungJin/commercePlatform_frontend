import type { ReactNode } from 'react';

type Tone = 'light' | 'dark';

/**
 * 메인(및 동일 타이포) 섹션 — 제목 앞 아이콘 + 부제
 * `tone="dark"` 는 어두운 패널 위(틸 아이콘 + hero-media-on-dark로 제목 밝게)
 */
export default function HomeSectionTitle({
  title,
  subtitle,
  icon,
  tone = 'light',
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  tone?: Tone;
}) {
  const iconWrap =
    tone === 'dark'
      ? 'text-teal-300 [&>svg]:h-[clamp(1.65rem,3vw,2.1rem)] [&>svg]:w-[clamp(1.65rem,3vw,2.1rem)]'
      : 'text-accent-teal [&>svg]:h-[clamp(1.65rem,3vw,2.1rem)] [&>svg]:w-[clamp(1.65rem,3vw,2.1rem)]';

  const headingWrap = tone === 'dark' ? 'hero-media-on-dark' : '';

  return (
    <header className={`mb-10 max-w-4xl md:mb-12 ${headingWrap}`.trim()}>
      <h2 className="flex flex-wrap items-start gap-x-3 gap-y-1 sm:items-center">
        <span className={`mt-1 inline-flex shrink-0 items-center justify-center sm:mt-0 ${iconWrap}`} aria-hidden>
          {icon}
        </span>
        <span className="home-album-strip-title popular-chart-section-title min-w-0 flex-1">
          {title}
        </span>
      </h2>
      <p className="home-album-strip-sub popular-chart-section-sub mt-3">{subtitle}</p>
    </header>
  );
}

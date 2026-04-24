'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Score } from '@/lib/scoresApi';
import AddToCartButton from '@/components/cart/AddToCartButton';
import ScoreListPricePill from '@/components/scores/ScoreListPricePill';
import { SampleScoreModalTrigger } from '@/components/modals/SampleScoreModal';
import { ScoreLyricModalTrigger } from '@/components/modals/ScoreLyricModal';

/** 앨범별 악보: CD/트랙·수록곡명을 악보 썸네일 왼쪽에 한 줄 블록으로 표시 */
export type ScoreSongRowTrackLead = {
  cd_number: number;
  track_number: number;
  title: string;
  artist: string;
};

interface Props {
  score: Score;
  /** 홈 «인기 악보 차트» — 썸네일 4:3·타이포 확대 */
  size?: 'default' | 'large';
  trackLead?: ScoreSongRowTrackLead | null;
}

/** 카탈로그 행 — 홈 인기 /scores 목록 공통 (라이트 스튜디오 톤) */
export default function ScoreSongRow({ score, size = 'default', trackLead = null }: Props) {
  const detail = `/scores?sid=${encodeURIComponent(String(score.score_sid))}`;
  const artistLine = [score.music.music_write, score.music.music_compose].filter(Boolean).join(' · ') || '—';
  const keysLine = `형식: ${score.score_type_name || '—'} · 조: ${score.chord_name || '—'} · 언어: ${score.language_name || '—'} · ${score.pages}p`;
  const lg = size === 'large';
  /** 가격 pill 가로 = 아래 아이콘 행(3×아이콘 + gap-x-1.5×2) — 중간 텍스트 영역 확보용으로 타이트 */
  const catalogActionColW = lg
    ? 'w-[8.25rem] min-w-[8.25rem] max-w-[8.25rem]'
    : 'w-[6.75rem] min-w-[6.75rem] max-w-[6.75rem]';

  const rowLayout = trackLead
    ? /* 앨범 트랙: 트랙 간 구분을 위해 하단선 유지(last 제거 — 단일 악보 트랙에서 선이 사라지던 문제) */
      `flex flex-row flex-wrap items-start justify-between gap-x-3 gap-y-4 border-b border-[var(--border-subtle)] first:pt-0 ${lg ? 'py-5 md:py-6' : 'py-4 sm:py-5'}`
    : `flex flex-col border-b border-[var(--border-subtle)] first:pt-0 last:border-b-0 sm:flex-row sm:items-center sm:gap-x-2 md:gap-x-3 ${lg ? 'gap-3 py-5 md:py-6' : 'gap-3 py-4'}`;

  return (
    <div className={rowLayout}>
      <div
        className={`flex min-w-0 flex-1 ${trackLead ? 'items-start' : 'items-center'} ${lg ? 'gap-3' : trackLead ? 'gap-3 sm:gap-4' : 'gap-2 sm:gap-2.5'}`}
      >
        {trackLead ? (
          <div
            className={`shrink-0 border-r border-[var(--border-subtle)] pr-3 sm:pr-4 ${lg ? 'w-48' : 'w-[7.5rem] sm:w-36 md:w-40'}`}
          >
            <p className="text-[11px] font-extrabold uppercase leading-tight tracking-wide text-accent-teal sm:text-sm md:text-[15px]">
              CD {trackLead.cd_number} · Track {trackLead.track_number}
            </p>
            <p
              className={`mt-0.5 font-semibold leading-snug text-text-primary line-clamp-2 ${lg ? 'text-sm' : 'text-[11px] sm:text-[13px]'}`}
            >
              {trackLead.title || '—'}
            </p>
            {trackLead.artist ? (
              <p className={`mt-0.5 truncate text-text-muted ${lg ? 'text-sm' : 'text-[10px] sm:text-xs'}`}>
                {trackLead.artist}
              </p>
            ) : null}
          </div>
        ) : null}
        <Link
          href={detail}
          className={`relative shrink-0 overflow-hidden rounded-md border border-solid border-[color:var(--border-strong)] bg-[#fff] ${
            trackLead
              ? 'block w-fit max-w-[min(100%,200px)]'
              : lg
                ? 'aspect-[4/3] w-[calc(6.75rem+30px)] shrink-0 sm:w-[calc(7.5rem+30px)]'
                : 'aspect-[4/3] w-[calc(3rem+30px)] shrink-0'
          }`}
        >
          {score.thumbnail_url ? (
            trackLead ? (
              <div className="box-border max-w-[min(100%,200px)] rounded-sm bg-[#fff] p-[10px]">
                {/* eslint-disable-next-line @next/next/no-img-element -- 높이를 이미지 비율대로 두어 aspect 고정 박스의 빈 영역을 없앰 */}
                <img
                  src={score.thumbnail_url}
                  alt=""
                  className="block h-auto w-full max-w-full object-cover"
                />
              </div>
            ) : (
              <div className="absolute inset-[10px] overflow-hidden rounded-sm bg-[#fff]">
                <Image
                  src={score.thumbnail_url}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes={lg ? '(min-width: 640px) 170px, 150px' : '78px'}
                />
              </div>
            )
          ) : trackLead ? (
            <span className="flex aspect-[3/4] min-h-[8rem] w-[min(100%,200px)] items-center justify-center bg-[#fff] text-4xl text-stone-500">
              ♪
            </span>
          ) : (
            <span
              className={`absolute inset-[10px] flex items-center justify-center rounded-sm bg-[#fff] text-stone-500 ${lg ? 'text-2xl sm:text-3xl' : 'text-lg'}`}
            >
              ♪
            </span>
          )}
        </Link>
        <div className={`min-w-0 flex-1 ${lg ? 'pt-1' : 'pt-0.5'}`}>
          <Link href={detail} className="block group">
            <h4
              className={`line-clamp-2 font-semibold leading-snug text-text-primary transition-colors group-hover:text-accent-teal-hover ${
                lg ? 'text-[17px] sm:text-lg md:text-xl' : 'text-[18px] sm:text-[19px]'
              }`}
            >
              {score.title}
            </h4>
          </Link>
          <p
            className={`mt-1 truncate leading-snug text-text-muted ${
              lg ? 'text-[15px] sm:text-base' : 'text-[15px]'
            }`}
          >
            {artistLine}
          </p>
          <p
            className={`leading-snug text-text-muted ${
              lg ? 'mt-1 text-sm sm:text-[15px]' : 'mt-0.5 text-[14px]'
            }`}
          >
            {keysLine}
          </p>
        </div>
   
      </div>
      <div
        className={`flex min-w-0 shrink-0 flex-col items-center gap-2 self-stretch sm:ml-auto sm:self-center ${
          trackLead
            ? lg
              ? 'min-w-[min(100%,220px)] w-full min-[480px]:w-auto sm:min-w-[240px]'
              : 'min-w-[min(100%,200px)] w-full pl-0 sm:w-auto'
            : lg
              ? 'w-full pl-[calc(6.75rem+30px+1rem)] sm:w-auto sm:min-w-0 sm:max-w-[8.25rem] sm:pl-0'
              : 'w-full pl-[calc(3rem+30px+0.5rem)] sm:w-auto sm:min-w-0 sm:max-w-[6.75rem] sm:pl-0'
        }`}
      >
        <div className={`flex shrink-0 flex-col items-stretch gap-2 ${catalogActionColW}`}>
          <ScoreListPricePill
            amount={Number(score.price)}
            href={detail}
            size={lg ? 'large' : 'default'}
            layout="default"
            className="w-full min-w-0"
          />
          <div className="flex w-full flex-row flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
          <SampleScoreModalTrigger
            sampleImageUrl={score.thumbnail_url}
            title={score.title}
            ariaLabel="미리보기"
            className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border-strong)] bg-surface-muted font-medium text-text-primary transition-colors hover:border-accent-teal/40 hover:bg-surface ${lg ? 'size-10' : 'size-8'}`}
          >
            <svg
              aria-hidden
              className={`shrink-0 ${lg ? 'h-5 w-5' : 'h-4 w-4'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
              <line x1="11" x2="11" y1="8" y2="14" />
              <line x1="8" x2="14" y1="11" y2="11" />
            </svg>
          </SampleScoreModalTrigger>
          <ScoreLyricModalTrigger
            scoreSid={score.score_sid}
            preview={{
              title: score.title,
              korName: score.music.kor_name,
              musicWrite: score.music.music_write,
              musicCompose: score.music.music_compose,
            }}
            ariaLabel="가사"
            className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border-strong)] bg-surface-muted font-medium text-text-primary transition-colors hover:border-accent-teal/40 hover:bg-surface ${lg ? 'size-10' : 'size-8'}`}
          >
            <svg
              aria-hidden
              className={`shrink-0 ${lg ? 'h-5 w-5' : 'h-4 w-4'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
          </ScoreLyricModalTrigger>
          <AddToCartButton scoreSid={score.score_sid} variant="catalogRow" sizeLarge={lg} label="" />
          </div>
        </div>
      </div>
    </div>
  );
}

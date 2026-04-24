'use client';

import { useEffect, useMemo, useState, type ReactNode, type SVGProps } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import HeroSearchPill from '@/components/layout/HeroSearchPill';
import ScoreSongRow from '@/components/scores/ScoreSongRow';
import { scoresApi, type AlbumScoresBundle } from '@/lib/scoresApi';

const metaIconClass = 'mt-0.5 h-4 w-4 shrink-0 text-orange-400/90';

/** 앨범 페이지 제목용 — 겹친 앨범 커버 실루엣 */
function AlbumStackIcon({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <rect x="5" y="7" width="14" height="14" rx="2" />
      <rect x="3" y="3" width="14" height="14" rx="2" />
    </svg>
  );
}

function MetaLine({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex gap-2.5 items-start">
      <span className="inline-flex shrink-0 text-orange-400/90 [&_svg]:h-4 [&_svg]:w-4">{icon}</span>
      <p className="min-w-0 flex-1 leading-snug text-neutral-300">
        <strong className="text-neutral-100">{label}</strong> {value}
      </p>
    </div>
  );
}

function AlbumScoresHero({
  title,
  subtitle,
  imageUrl,
}: {
  title: string;
  subtitle?: string;
  /** 있으면 히어로 배경으로 사용 */
  imageUrl?: string | null;
}) {
  const showCaption = Boolean(title.trim());
  const useAlbumBg = Boolean(imageUrl?.trim());
  return (
    <section className="relative isolate min-h-[270px] overflow-hidden border-b border-white/[0.06]">
      {useAlbumBg ? (
        <Image
          src={imageUrl!}
          alt=""
          fill
          unoptimized
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
      ) : (
        <Image
          src="/img/_common/bass-622598.jpg"
          alt=""
          fill
          className="object-cover object-[22%_center]"
          sizes="(min-width: 1440px) 1440px, 100vw"
          priority
        />
      )}
      <div
        className={`pointer-events-none absolute inset-0 z-[1] ${useAlbumBg ? 'bg-black/60' : 'bg-black/50'}`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/25 to-black/55"
        aria-hidden
      />
      <div className="relative z-10 mx-auto flex max-w-pc flex-col items-center px-4 py-7 sm:px-6 md:py-9">
        {showCaption ? (
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="home-album-strip-title popular-chart-section-title">{title}</h1>
            {subtitle ? (
              <p className="home-album-strip-sub popular-chart-section-sub mx-auto mt-3 max-w-3xl text-balance">
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className={`mx-auto flex w-full max-w-xl justify-center ${showCaption ? 'mt-5 md:mt-6' : ''}`}>
          <HeroSearchPill className="w-full" />
        </div>
      </div>
    </section>
  );
}

export default function AlbumScoresClient() {
  const searchParams = useSearchParams();
  const sid = useMemo(() => (searchParams.get('sid') ?? '').trim(), [searchParams]);
  const [data, setData] = useState<AlbumScoresBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sid) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    scoresApi
      .albumScoresBundle(sid)
      .then((r) => {
        if (!cancelled) setData(r.data);
      })
      .catch(() => {
        if (!cancelled) {
          setError('앨범 정보를 불러오지 못했습니다.');
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sid]);

  if (!sid) {
    return (
      <div className="min-h-[50vh] border-t border-neutral-900 bg-[var(--background)]">
        <AlbumScoresHero title="" />
        <div className="mx-auto max-w-pc px-4 py-16 text-center text-neutral-500">
          <p>앨범 코드가 없습니다.</p>
          <Link href="/scores" className="mt-4 inline-block text-teal-400 hover:underline">
            악보 목록으로
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] bg-[var(--background)]">
        <AlbumScoresHero title="" />
        <div className="mx-auto max-w-pc px-4 py-16 animate-pulse">
          <div className="h-8 w-2/3 max-w-md rounded bg-neutral-900" />
          <div className="mt-8 h-40 w-full max-w-xl rounded-xl bg-neutral-900" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[50vh] border-t border-neutral-900 bg-[var(--background)]">
        <AlbumScoresHero title="앨범" />
        <div className="mx-auto max-w-pc px-4 py-16 text-center text-neutral-400">
          <p>{error ?? '데이터가 없습니다.'}</p>
          <Link href="/scores" className="mt-4 inline-block text-teal-400 hover:underline">
            악보 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const { album, tracks } = data;
  const heroSubtitle = [album.artist, album.second_name].filter(Boolean).join(' · ') || undefined;
  const release =
    typeof album.announcement_year === 'string'
      ? album.announcement_year.slice(0, 10)
      : String(album.announcement_year ?? '');

  return (
    <div className="min-h-[60vh] border-t border-neutral-900 bg-[var(--background)]">
      <AlbumScoresHero title={album.name} subtitle={heroSubtitle} imageUrl={album.thumbnail_url} />

      <div className="mx-auto max-w-pc px-4 py-10 md:py-14">
        <div className="rounded-2xl border border-neutral-800 bg-[var(--surface)] p-6 md:p-10">
          <header className="mb-8 border-b border-neutral-800 pb-6 md:mb-10 md:pb-8">
            <div className="flex items-start gap-3 md:items-center md:gap-4">
              <AlbumStackIcon className="mt-0.5 h-8 w-8 shrink-0 text-orange-500 md:mt-0 md:h-9 md:w-9" />
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold leading-[1.2] tracking-tight text-white text-balance md:text-3xl lg:text-[2rem]">
                  {album.name || '—'}
                </h2>
                {heroSubtitle ? (
                  <p className="mt-2 text-sm leading-snug text-neutral-400 md:text-base">{heroSubtitle}</p>
                ) : null}
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-8 sm:[--album-sq:24.75rem] lg:[--album-sq:27rem] lg:grid lg:min-h-0 lg:grid-cols-2 lg:items-start lg:gap-10">
            {/* 1단: 앨범 이미지(정사각) + 메타 — sm~ 에서 세로 = 이미지 한 변과 동일 */}
            <div className="grid w-full flex-1 grid-cols-1 items-start gap-6 sm:grid-cols-[auto_1fr] sm:gap-8">
              <div className="mx-auto w-[min(100%,24.75rem)] shrink-0 sm:mx-0 sm:w-[var(--album-sq)] lg:w-[var(--album-sq)]">
                {album.thumbnail_url ? (
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900">
                    <Image
                      src={album.thumbnail_url}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(min-width: 1024px) 432px, 396px"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-5xl text-neutral-600 lg:text-6xl">
                    ♪
                  </div>
                )}
              </div>

              <div className="min-w-0 rounded-xl border border-neutral-800/80 bg-neutral-950/40 px-4 py-4 sm:box-border sm:flex sm:h-[var(--album-sq)] sm:min-h-0 sm:max-h-[var(--album-sq)] sm:flex-col sm:overflow-hidden sm:px-5 sm:py-4">
                <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto text-sm text-neutral-300 sm:pr-1 md:text-[15px]">
                  <MetaLine
                    label="앨범구분 :"
                    value={album.gubn_name || '—'}
                    icon={
                      <svg
                        aria-hidden
                        className={metaIconClass}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                    }
                  />
                  <MetaLine
                    label="앨범형식 :"
                    value={album.type_name || '—'}
                    icon={
                      <svg aria-hidden className={metaIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="5" y="2" width="14" height="20" rx="2" />
                        <path d="M12 18h.01" />
                      </svg>
                    }
                  />
                  <MetaLine
                    label="아티스트 :"
                    value={album.artist || '—'}
                    icon={
                      <svg aria-hidden className={metaIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    }
                  />
                  <MetaLine
                    label="발매일 :"
                    value={release || '—'}
                    icon={
                      <svg aria-hidden className={metaIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18" />
                      </svg>
                    }
                  />
                  <MetaLine
                    label="기본장르 :"
                    value={album.theme_name || '—'}
                    icon={
                      <svg aria-hidden className={metaIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    }
                  />
                  <MetaLine
                    label="세부장르 :"
                    value={album.details_theme_name || '—'}
                    icon={
                      <svg aria-hidden className={metaIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                    }
                  />
                  <MetaLine
                    label="기획사 :"
                    value={album.agency || '—'}
                    icon={
                      <svg aria-hidden className={metaIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                        <path d="M6 12h12M10 12v10M14 12v10" />
                      </svg>
                    }
                  />
                  <MetaLine
                    label="유통사 :"
                    value={album.distribution || '—'}
                    icon={
                      <svg aria-hidden className={metaIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                        <polyline points="7.5 19.79 7.5 14.6 3 12" />
                        <polyline points="21 12 16.5 14.6 16.5 19.79" />
                        <path d="M12 11.09v6.82" />
                      </svg>
                    }
                  />
                </div>
              </div>
            </div>

            {/* 2단: 앨범 소개 */}
            <div className="min-w-0 w-full lg:flex-1">
              <section aria-label="앨범 소개">
                {album.intro ? (
                  <div className="album-intro-scroll max-h-[250px] overflow-y-auto overscroll-contain rounded-lg border border-neutral-800 bg-neutral-950/60 px-4 py-3 [scrollbar-gutter:stable] sm:box-border sm:max-h-none sm:h-[var(--album-sq)] sm:px-4 sm:py-3">
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-300 md:text-[15px]">
                      {album.intro}
                    </p>
                  </div>
                ) : (
                  <p className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-4 py-6 text-sm text-neutral-600 max-sm:py-6 sm:flex sm:h-[var(--album-sq)] sm:items-center sm:justify-center sm:py-4">
                    등록된 앨범 소개가 없습니다.
                  </p>
                )}
              </section>
            </div>
          </div>

          <hr className="my-10 border-neutral-800" />

          <div className="space-y-10">
            {tracks.length === 0 ? (
              <p className="text-center text-neutral-500">등록된 트랙이 없습니다.</p>
            ) : (
              tracks.map((t) => {
                const lead = {
                  cd_number: t.cd_number,
                  track_number: t.track_number,
                  title: t.title || '—',
                  artist: t.artist || '',
                };
                return (
                  <div key={t.track_sid} className="space-y-0">
                    {t.scores.length === 0 ? (
                      <div className="flex flex-row flex-wrap items-start justify-between gap-x-3 gap-y-4 border-b border-white/[0.14] py-4 sm:py-5">
                        <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                          <div className="w-[7.5rem] shrink-0 border-r border-neutral-800 pr-3 sm:w-36 sm:pr-4 md:w-40">
                            <p className="text-[11px] font-extrabold uppercase leading-tight tracking-wide text-teal-200 sm:text-sm md:text-[15px]">
                              CD {t.cd_number} · Track {t.track_number}
                            </p>
                            <p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-snug text-white sm:text-[13px]">
                              {t.title || '—'}
                            </p>
                            {t.artist ? (
                              <p className="mt-0.5 truncate text-[10px] text-neutral-400 sm:text-xs">{t.artist}</p>
                            ) : null}
                          </div>
                          <p className="min-w-0 flex-1 pt-0.5 text-sm text-neutral-500 sm:max-w-md">
                            연결된 악보가 없습니다.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {t.scores.map((s) => (
                          <ScoreSongRow key={s.score_sid} score={s} trackLead={lead} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

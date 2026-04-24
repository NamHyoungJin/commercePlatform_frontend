'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from '@/components/AppLink';
import { scoresApi, Score, type FilterOption } from '@/lib/scoresApi';
import HeroSearchPill from '@/components/layout/HeroSearchPill';
import AddToCartButton from '@/components/cart/AddToCartButton';
import AddToWishButton from '@/components/wish/AddToWishButton';
import VocalRangeKeyFinderSection from '@/components/scores/VocalRangeKeyFinderSection';
import { lyricsToPlainText, ScoreLyricModalTrigger } from '@/components/modals/ScoreLyricModal';

const btnOutline =
  'inline-flex min-h-[2.5rem] items-center justify-center rounded-md border border-[var(--border-strong)] bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition-colors hover:border-accent-teal/40 hover:bg-surface-muted';

const metaIcon = 'h-4 w-4 shrink-0 text-text-muted';

/** 히어로용: «Verse 1»·«Chorus»·«1절» 같은 줄은 제외하고 실제 가사 첫 줄 */
function isLyricSectionLabelLine(line: string): boolean {
  const s = line.trim();
  if (!s) return true;
  const t = s.replace(/^[【［\[(]/, '').replace(/[】］\])]$/, '').trim();

  if (/^(후렴|간주|브릿지|인트로)(\s*\d*)?$/.test(s)) return true;
  if (/^\d+\s*절$/.test(s)) return true;

  return /^(verse|chorus|bridge|pre[\s-]?chorus|intro|outro|hook|refrain|tag|turn|inst\.?|instrumental)(\s*[\d.:]*)?$/i.test(
    t,
  );
}

function chordLineForScoreRow(s: Pick<Score, 'chord_name' | 'chord_scales_name'>) {
  const a = s.chord_name || '';
  const b = s.chord_scales_name || '';
  return `${a}${b}`.trim() || '—';
}

function firstSubstantiveLyricLine(plain: string): string {
  const lines = plain
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const hit = lines.find((l) => !isLyricSectionLabelLine(l));
  return hit ?? '';
}

type ScoreDetailHeroProps = {
  /** 로딩 중이면 생략 — 검색만 표시 */
  title?: string;
  lyricFirstLine?: string;
};

/** `/scores?sort=newest` 차트 히어로와 동일 배경 + 제목·가사 첫 줄(본문과 중복 표기) */
function ScoreDetailHeroSearch({ title, lyricFirstLine }: ScoreDetailHeroProps) {
  const showCaption = Boolean(title?.trim());
  return (
    <section className="relative isolate min-h-[270px] overflow-hidden border-b border-white/[0.06]">
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
      <div className="hero-media-on-dark relative z-10 mx-auto flex max-w-pc flex-col items-center px-4 py-7 sm:px-6 md:py-9">
        {showCaption ? (
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="home-album-strip-title popular-chart-section-title">{title}</h1>
            {lyricFirstLine ? (
              <p className="home-album-strip-sub popular-chart-section-sub mx-auto mt-3 max-w-3xl text-balance">
                {lyricFirstLine}
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

export default function ScoreDetailView({ scoreSid }: { scoreSid: string }) {
  const router = useRouter();
  const [score, setScore] = useState<Score | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreTypes, setScoreTypes] = useState<FilterOption[]>([]);
  const [heroLyricFirstLine, setHeroLyricFirstLine] = useState('');

  useEffect(() => {
    scoresApi.filters().then((r) => setScoreTypes(r.data.score_types));
  }, []);

  useEffect(() => {
    scoresApi
      .detail(scoreSid)
      .then((r) => {
        setScore(r.data);
      })
      .catch(() => router.push('/scores'))
      .finally(() => setLoading(false));
  }, [scoreSid, router]);

  useEffect(() => {
    let cancelled = false;
    setHeroLyricFirstLine('');
    scoresApi
      .lyrics(scoreSid)
      .then((r) => {
        if (cancelled) return;
        const plain = lyricsToPlainText(r.data.lyrics);
        setHeroLyricFirstLine(firstSubstantiveLyricLine(plain));
      })
      .catch(() => {
        if (!cancelled) setHeroLyricFirstLine('');
      });
    return () => {
      cancelled = true;
    };
  }, [scoreSid]);

  const chordLine = useMemo(() => {
    if (!score) return '—';
    const a = score.chord_name || '';
    const b = score.chord_scales_name || '';
    return `${a}${b}`.trim() || '—';
  }, [score]);

  const scoresByType = useMemo(() => {
    const m = new Map<string, Score[]>();
    if (!score?.music_scores?.length) return m;
    for (const s of score.music_scores) {
      const t = (s.score_type || '').trim();
      if (!t) continue;
      const arr = m.get(t) ?? [];
      arr.push(s);
      m.set(t, arr);
    }
    return m;
  }, [score]);

  const sampleUrl = score?.sample_image_url ?? score?.thumbnail_url ?? null;

  if (loading) {
    return (
      <div className="min-h-[50vh] bg-background">
        <ScoreDetailHeroSearch />
        <div className="mx-auto max-w-pc px-4 py-16 animate-pulse">
          <div className="h-8 w-2/3 max-w-xl rounded bg-stone-200" />
          <div className="mt-8 h-64 w-full max-w-2xl rounded-xl bg-stone-200" />
        </div>
      </div>
    );
  }

  if (!score) return null;

  return (
    <div className="min-h-[60vh] border-t border-[var(--border-subtle)] bg-background">
      <ScoreDetailHeroSearch title={score.title} lyricFirstLine={heroLyricFirstLine} />

      <div className="mx-auto max-w-pc px-4 py-10 md:py-14">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-surface p-6 shadow-sm md:p-10">
          {/* 1:5 — 악보형식(왼쪽)이 카드 상단부터, 제목은 그 오른쪽 열에서 시작 */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-6 lg:items-start lg:gap-10">
            <aside className="row-start-2 lg:row-start-1 lg:col-span-1">
              <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-surface-muted shadow-[0_16px_40px_-20px_rgba(0,0,0,0.12)] lg:sticky lg:top-24">
                <div className="relative aspect-square w-full overflow-hidden bg-[#fff] p-[20px]">
                  {sampleUrl ? (
                    <img src={sampleUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl text-stone-400">♪</div>
                  )}
                  {score.youtube_id ? (
                    <a
                      href="#score-detail-video"
                      className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/70"
                      aria-label="동영상으로 이동"
                    >
                      <span className="ml-0.5 text-lg">▶</span>
                    </a>
                  ) : null}
                </div>

                <div className="border-t border-[var(--border-subtle)] p-1.5">
                  {(scoreTypes.length ? scoreTypes : [{ code: score.score_type, name: score.score_type_name || '—' }]).map(
                    (opt) => {
                      const variants = scoresByType.get(opt.code) ?? [];
                      const exists = variants.length > 0;

                      if (!exists) {
                        return (
                            <div key={opt.code} className="block rounded-lg">
                            <div
                              className="relative flex min-h-[3.25rem] cursor-not-allowed items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 pr-2 opacity-45 transition-colors"
                              aria-disabled
                            >
                              <div className="min-w-0 flex-1 pl-1">
                                <p className="truncate text-[13px] font-semibold leading-tight text-text-muted">
                                  {opt.name}
                                </p>
                                <p className="mt-0.5 text-[11px] text-text-muted">해당 형식 없음</p>
                              </div>
                              <span className="shrink-0 rounded-full bg-stone-200/90 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-text-muted ring-1 ring-[var(--border-subtle)]">
                                —
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={opt.code} className={variants.length > 1 ? 'space-y-1' : ''}>
                          {variants.map((v) => {
                            const active = v.score_sid === score.score_sid;
                            const chordShown = chordLineForScoreRow(v);
                            const detailExtra = variants.length > 1 ? ` · ${v.title}` : '';

                            const row = (
                              <div className="relative flex min-h-[3.25rem] items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 pr-2 transition-colors">
                                {active ? (
                                  <span
                                    className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-accent-teal shadow-[0_0_12px_rgba(15,118,110,0.35)]"
                                    aria-hidden
                                  />
                                ) : null}
                                <div className={`min-w-0 flex-1 ${active ? 'pl-2.5' : 'pl-1'}`}>
                                  <p className="truncate text-[13px] font-semibold leading-tight text-text-primary">{opt.name}</p>
                                  <p className="mt-0.5 truncate text-[11px] leading-snug text-text-muted">
                                    {v.pages}p · {chordShown}
                                    {detailExtra}
                                  </p>
                                </div>
                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums ${
                                    active
                                      ? 'bg-teal-100 text-teal-900 ring-1 ring-teal-300/80'
                                      : 'bg-amber-50 text-amber-900 ring-1 ring-amber-200/90'
                                  }`}
                                >
                                  {v.price != null ? `${v.price.toLocaleString()}원` : '—'}
                                </span>
                              </div>
                            );

                            if (active) {
                              return (
                                <div key={v.score_sid} className="rounded-lg bg-teal-50/80">
                                  {row}
                                </div>
                              );
                            }
                            return (
                              <Link
                                key={v.score_sid}
                                href={`/scores?sid=${encodeURIComponent(v.score_sid)}`}
                                className="block rounded-lg hover:bg-stone-100/90"
                              >
                                {row}
                              </Link>
                            );
                          })}
                        </div>
                      );
                    },
                  )}
                </div>

                <div className="border-t border-[var(--border-subtle)] p-2">
                  <Link
                    href={`/scoresSearch?music_sid=${encodeURIComponent(score.music.music_sid)}`}
                    className="block w-full rounded-full border border-[var(--border-subtle)] bg-surface py-2.5 text-center text-[11px] font-medium text-text-secondary transition hover:border-accent-teal/35 hover:text-accent-teal-hover"
                  >
                    전체 악보 보기
                  </Link>
                </div>
              </div>
            </aside>

            <div className="row-start-1 min-w-0 space-y-8 lg:col-span-5 lg:col-start-2">
              <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-8">
                <div className="min-w-0">
                  <h1 className="flex items-start gap-3 text-2xl font-bold tracking-tight text-text-primary md:items-center md:text-3xl">
                    <svg
                      aria-hidden
                      className="mt-1 h-8 w-8 shrink-0 text-accent-teal md:mt-0 md:h-9 md:w-9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span className="min-w-0">{score.title}</span>
                  </h1>
                  {heroLyricFirstLine || score.title_sub ? (
                    <p className="mt-2 text-sm text-text-muted">
                      {heroLyricFirstLine || score.title_sub}
                    </p>
                  ) : null}
                </div>
                <div className="min-w-0 space-y-2 border-t border-[var(--border-subtle)] pt-4 text-sm text-text-muted md:border-t-0 md:border-l md:border-l-[var(--border-subtle)] md:pl-8 md:pt-0">
                  <p className="md:text-right">
                    <span className="text-text-muted">형식</span>{' '}
                    <span className="font-medium text-text-primary">{score.score_type_name || '—'}</span>
                    <span className="text-text-muted"> · </span>
                    <span className="text-text-muted">페이지</span>{' '}
                    <span className="font-medium text-text-primary tabular-nums">{score.pages}p</span>
                    <span className="text-text-muted"> · </span>
                    <span className="text-text-muted">언어</span>{' '}
                    <span className="font-medium text-text-primary">{score.language_name || '—'}</span>
                    <span className="text-text-muted"> · </span>
                    <span className="text-text-muted">조회</span>{' '}
                    <span className="inline-flex items-center gap-1 font-medium text-text-primary">
                      <span className="tabular-nums">{score.hit.toLocaleString()}</span>
                    </span>
                  </p>
                  <p className="md:text-right">
                    <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">가격</span>
                    <span className="mt-1 block text-3xl font-extrabold tabular-nums tracking-tight text-accent-amber md:mt-0 md:inline md:pl-2 md:text-4xl">
                      {score.price.toLocaleString()}
                      <span className="text-xl font-bold text-accent-amber-soft md:text-2xl">원</span>
                    </span>
                  </p>
                </div>
              </div>

              <hr className="border-[var(--border-subtle)]" />

              <div className="flex flex-col gap-5 pb-6 md:flex-row md:items-start md:justify-between md:gap-6 md:pb-8">
                <div className="min-w-0 flex-1 space-y-3 text-sm text-text-secondary md:text-[15px]">
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
                    <span className="inline-flex items-center gap-1.5">
                      <svg
                        aria-hidden
                        className={metaIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      <span className="text-text-muted">작사 :</span>
                      <span className="text-text-primary">{score.music.music_write || '—'}</span>
                    </span>
                    <span className="text-text-muted">,</span>
                    <span className="inline-flex items-center gap-1.5">
                      <svg
                        aria-hidden
                        className={metaIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                      <span className="text-text-muted">작곡 :</span>
                      <span className="text-text-primary">{score.music.music_compose || '—'}</span>
                    </span>
                  </p>
                  <p className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
                    <span className="inline-flex items-center gap-1.5">
                      <svg
                        aria-hidden
                        className={metaIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" x2="22" y1="12" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                      <span className="text-text-muted">언어 :</span>
                      <span className="text-text-primary">{score.language_name || '—'}</span>
                    </span>
                    <span className="text-text-muted">,</span>
                    <span className="inline-flex items-center gap-1.5">
                      <svg
                        aria-hidden
                        className={metaIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {/* 샵(#) — 반음 올림 느낌 */}
                        <line x1="2.5" y1="7" x2="10" y2="7" />
                        <line x1="2.5" y1="11" x2="10" y2="11" />
                        <line x1="5" y1="4" x2="4" y2="14" />
                        <line x1="8.5" y1="4" x2="7.5" y2="14" />
                        {/* ♭ — 반음 내림 느낌 (세로선 + 오른쪽 볼) */}
                        <line x1="14" y1="4" x2="14" y2="20" />
                        <path d="M14 11.5c3.2-1.2 5.5 0.2 5.5 3.2s-2.3 4.8-5.5 3.8" />
                      </svg>
                      <span className="text-text-muted">조표 :</span>
                      <span className="text-text-primary">{chordLine}</span>
                    </span>
                  </p>
                </div>

                <div className="flex min-w-0 flex-col items-stretch gap-3 md:shrink-0 md:items-end">
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <ScoreLyricModalTrigger
                      scoreSid={score.score_sid}
                      preview={{
                        title: score.title,
                        korName: score.music.kor_name,
                        musicWrite: score.music.music_write,
                        musicCompose: score.music.music_compose,
                      }}
                      className={`${btnOutline} gap-2`}
                    >
                      <svg
                        aria-hidden
                        className="h-5 w-5 shrink-0"
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
                      가사보기
                    </ScoreLyricModalTrigger>
                    <AddToWishButton scoreSid={score.score_sid} />
                    <AddToCartButton scoreSid={score.score_sid} variant="detail" label="장바구니 넣기" />
                  </div>
                </div>
              </div>

              <hr className="border-[var(--border-subtle)]" />

              <div className="w-full">
                {sampleUrl ? (
                  <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[#fff] p-[80px] shadow-md">
                    <img
                      src={sampleUrl}
                      alt={score.title}
                      className="mx-auto block max-h-[min(92vh,920px)] w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-surface-muted py-24 text-center text-6xl text-stone-400">
                    ♪
                  </div>
                )}
              </div>

              <VocalRangeKeyFinderSection score={score} />

              {score.youtube_id ? (
                <>
                  <hr className="border-[var(--border-subtle)]" />
                  <div
                    id="score-detail-video"
                    className="aspect-video w-full scroll-mt-28 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-black shadow-md"
                  >
                    <iframe
                      title="YouTube"
                      src={`https://www.youtube.com/embed/${encodeURIComponent(score.youtube_id)}`}
                      className="h-full min-h-[240px] w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </>
              ) : null}

              {score.related_album ? (
                <>
                  <hr className="border-[var(--border-subtle)]" />
                  <Link
                    href={`/scores/album?sid=${encodeURIComponent(score.related_album.album_sid)}`}
                    className="group block rounded-xl outline-offset-2 transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-teal/60"
                    aria-label={`${score.related_album.name} 앨범별 악보 보기`}
                  >
                    <section>
                      <h2 className="text-lg font-semibold text-text-primary transition-colors group-hover:text-accent-teal-hover md:text-xl">
                        수록 Album
                      </h2>
                      <p className="mt-1 text-xs text-text-muted group-hover:text-text-secondary">
                        클릭하면 이 앨범의 악보 목록으로 이동합니다.
                      </p>
                      <div className="mt-6 flex flex-col gap-8 sm:flex-row sm:items-start">
                        <div className="mx-auto w-40 shrink-0 sm:mx-0 sm:w-44">
                          {score.related_album.thumbnail_url ? (
                            <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-surface-muted ring-0 transition-[box-shadow] group-hover:ring-1 group-hover:ring-accent-teal/30">
                              <Image
                                src={score.related_album.thumbnail_url}
                                alt={score.related_album.name}
                                fill
                                unoptimized
                                className="object-cover"
                                sizes="176px"
                              />
                            </div>
                          ) : (
                            <div className="flex aspect-square items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-surface-muted text-3xl text-stone-400">
                              ♪
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-3 text-sm text-text-secondary md:text-[15px]">
                          <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-8">
                            <p>
                              <strong className="text-text-primary">앨범구분 :</strong>{' '}
                              {score.related_album.gubn_name || '—'}
                            </p>
                            <p className="sm:text-right">
                              <strong className="text-text-primary">앨범형식 :</strong>{' '}
                              {score.related_album.type_name || '—'}
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-8">
                            <p>
                              <strong className="text-text-primary">아티스트 :</strong>{' '}
                              {score.related_album.artist || '—'}
                            </p>
                            <p className="sm:text-right">
                              <strong className="text-text-primary">발매일 :</strong>{' '}
                              {score.related_album.announcement_year || '—'}
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-8">
                            <p>
                              <strong className="text-text-primary">기획사 :</strong>{' '}
                              {score.related_album.agency || '—'}
                            </p>
                            <p className="sm:text-right">
                              <strong className="text-text-primary">유통사 :</strong>{' '}
                              {score.related_album.distribution || '—'}
                            </p>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2 sm:gap-x-8">
                            <p>
                              <strong className="text-text-primary">기본장르 :</strong>{' '}
                              {score.related_album.theme_name || '—'}
                            </p>
                            <p className="sm:text-right">
                              <strong className="text-text-primary">세부장르 :</strong>{' '}
                              {score.related_album.details_theme_name || '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </Link>
                </>
              ) : null}

              <p className="border-t border-[var(--border-subtle)] pt-6 text-center text-xs text-text-muted sm:text-left">
                조회 {score.hit.toLocaleString()} · {score.pages}페이지
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

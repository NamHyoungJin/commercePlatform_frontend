'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import ScoreSongRow from '@/components/scores/ScoreSongRow';
import ScoreFilter from '@/components/scores/ScoreFilter';
import HeroSearchPill from '@/components/layout/HeroSearchPill';
import { scoresApi, Score, FilterOptions, ScoreListParams } from '@/lib/scoresApi';
import { LIST_PAGINATION_ACTIVE_CLASS, LIST_PAGINATION_BUTTON_CLASS } from '@/lib/listPaginationClasses';

const PAGE_SIZE = 20;

function pageWindow(current: number, total: number, width = 5): number[] {
  if (total <= 0) return [1];
  const half = Math.floor(width / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + width - 1);
  start = Math.max(1, end - width + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

const pageBtn = LIST_PAGINATION_BUTTON_CLASS;
const pageBtnActive = LIST_PAGINATION_ACTIVE_CLASS;

const SCORE_TYPE_ALLOWED = ['SYS13A17B002', 'SYS20304B001', 'SYS20313B001'] as const;

export default function ScoresTypeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawType = searchParams.get('type') ?? '';
  const validType = (SCORE_TYPE_ALLOWED as readonly string[]).includes(rawType) ? rawType : '';

  const [scores, setScores] = useState<Score[]>([]);
  const [filters, setFilters] = useState<FilterOptions | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState<string | null>(null);
  const [prev, setPrev] = useState<string | null>(null);

  const page = Number(searchParams.get('page') ?? 1) || 1;
  const sort = searchParams.get('sort') ?? 'newest';

  /** 메인 «인기 악보 차트»와 동일 톤·타이포·2열 large 행 */
  const chartListStyle = sort === 'newest' || sort === 'popular';

  const hero = useMemo(() => {
    if (sort === 'popular') {
      return {
        title: '인기 악보 차트',
        subtitle: '지금 가장 많이 찾는 악보입니다. 두 열로 빠르게 훑어보세요.',
      };
    }
    if (sort === 'newest') {
      return {
        title: '최신 악보',
        subtitle: '가장 최근에 등록된 악보입니다.',
      };
    }
    return {
      title: '악보 형식',
      subtitle: '형식별로 악보를 찾아보세요.',
    };
  }, [sort]);

  useEffect(() => {
    if (!validType) {
      router.replace('/scores');
    }
  }, [validType, router]);

  useEffect(() => {
    scoresApi.filters().then((r) => setFilters(r.data));
  }, []);

  useEffect(() => {
    if (!validType) return;
    setLoading(true);
    const params: ScoreListParams = {
      q: searchParams.get('q') ?? undefined,
      type: validType,
      language: searchParams.get('language') ?? undefined,
      chord: searchParams.get('chord') ?? undefined,
      sort: (searchParams.get('sort') as ScoreListParams['sort']) ?? 'newest',
      page,
    };
    scoresApi
      .list(params)
      .then((r) => {
        setScores(r.data.results);
        setTotal(r.data.count);
        setNext(r.data.next);
        setPrev(r.data.previous);
      })
      .finally(() => setLoading(false));
  }, [searchParams, validType, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goPage = (p: number) => {
    const nextPage = Math.min(Math.max(1, p), totalPages);
    const pStr = new URLSearchParams(searchParams.toString());
    if (nextPage <= 1) pStr.delete('page');
    else pStr.set('page', String(nextPage));
    router.push(`/scoresType?${pStr.toString()}`);
  };

  const pages = pageWindow(page, totalPages, 6);

  const heroSearch = (
    <div className="mt-8 md:mt-10">
      <HeroSearchPill tone="light" initialQuery={searchParams.get('q') ?? ''} />
    </div>
  );

  const filterCardClass =
    'rounded-xl border border-[var(--border-subtle)] bg-surface p-5 shadow-md shadow-neutral-900/[0.06]';

  const titleBlock = (
    <div className="min-w-0 shrink-0 lg:max-w-xl">
      {chartListStyle ? (
        <>
          <h1 className="home-album-strip-title popular-chart-section-title">{hero.title}</h1>
          <p className="home-album-strip-sub popular-chart-section-sub mt-3 max-w-4xl">{hero.subtitle}</p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">{hero.title}</h1>
          <p className="home-album-strip-sub mt-3 max-w-2xl">{hero.subtitle}</p>
        </>
      )}
      <p className="mt-6 text-sm text-text-muted md:mt-8">
        총 <span className="font-medium text-text-primary">{total.toLocaleString()}</span>건
      </p>
    </div>
  );

  const filterBlock = (
    <div className="w-full min-w-0 shrink-0 lg:max-w-md xl:max-w-lg">
      <div className={filterCardClass}>
        {filters ? (
          <ScoreFilter filters={filters} basePath="/scoresType" preserveTypeCode={validType} />
        ) : (
          <div className="space-y-4 animate-pulse" aria-hidden>
            <div className="h-9 rounded-lg bg-stone-200" />
            <div className="flex flex-wrap gap-2">
              <div className="h-8 w-16 rounded-full bg-stone-200" />
              <div className="h-8 w-16 rounded-full bg-stone-200" />
              <div className="h-8 w-20 rounded-full bg-stone-200" />
            </div>
            <div className="h-24 rounded-lg bg-stone-200/80" />
          </div>
        )}
      </div>
    </div>
  );

  const chartToolbarFilters = (
    <div className="mb-8 rounded-xl border border-[var(--border-subtle)] bg-surface/90 p-4 shadow-sm backdrop-blur-sm sm:p-5 md:mb-10">
      {filters ? (
        <ScoreFilter
          filters={filters}
          layout="toolbar"
          hideSearch
          basePath="/scoresType"
          preserveTypeCode={validType}
        />
      ) : (
        <div className="flex flex-col gap-4 animate-pulse xl:flex-row xl:flex-wrap xl:gap-6" aria-hidden>
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-20 rounded-full bg-stone-200" />
            <div className="h-8 w-14 rounded-full bg-stone-200" />
            <div className="h-8 w-14 rounded-full bg-stone-200" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-8 w-16 rounded-full bg-stone-200" />
            <div className="h-8 w-16 rounded-full bg-stone-200" />
          </div>
          <div className="h-8 w-40 rounded-full bg-stone-200" />
        </div>
      )}
    </div>
  );

  const typeLabel = filters?.score_types.find((t) => t.code === validType)?.name ?? '';

  const chartHeroTitle = (
    <div className="mx-auto max-w-4xl text-center">
      <h1 className="home-album-strip-title popular-chart-section-title">악보 형식</h1>
      <p className="home-album-strip-sub popular-chart-section-sub mx-auto mt-3 max-w-3xl">
        {typeLabel ? `${typeLabel} 악보를 모아 보았습니다.` : '형식별 악보를 확인하세요.'}
      </p>
    </div>
  );

  if (!validType) {
    return <div className="min-h-[50vh] bg-background" />;
  }

  const listBody = chartListStyle ? (
    <>
      {loading ? (
        <div className="min-w-0 divide-y divide-[var(--border-subtle)]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse gap-4 border-b border-[var(--border-subtle)] py-5 md:py-6 last:border-b-0"
            >
              <div className="h-[4.5rem] w-[6.75rem] shrink-0 rounded-md bg-stone-200 sm:h-20 sm:w-[7.5rem]" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-5 w-2/3 rounded bg-stone-200" />
                <div className="h-4 w-1/2 rounded bg-stone-200" />
              </div>
            </div>
          ))}
        </div>
      ) : scores.length === 0 ? (
        <div className="py-20 text-center text-sm text-text-muted">검색 결과가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 gap-y-0 lg:grid-cols-2 lg:gap-x-12 xl:gap-x-20 2xl:gap-x-24">
          <div className="min-w-0">
            {scores.slice(0, Math.ceil(scores.length / 2)).map((score) => (
              <ScoreSongRow key={score.score_sid} score={score} size="large" />
            ))}
          </div>
          <div className="min-w-0">
            {scores.slice(Math.ceil(scores.length / 2)).map((score) => (
              <ScoreSongRow key={score.score_sid} score={score} size="large" />
            ))}
          </div>
        </div>
      )}
    </>
  ) : (
    <>
      {loading ? (
        <div className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-surface">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 animate-pulse">
              <div className="h-12 w-12 shrink-0 rounded-md bg-stone-200" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-2/3 rounded bg-stone-200" />
                <div className="h-3 w-1/2 rounded bg-stone-200" />
              </div>
            </div>
          ))}
        </div>
      ) : scores.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-surface py-20 text-center text-sm text-text-muted">
          검색 결과가 없습니다.
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-surface px-2 sm:px-4 md:px-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 xl:divide-x xl:divide-[var(--border-subtle)]">
            <div className="py-2 xl:pr-6">
              {scores.slice(0, Math.ceil(scores.length / 2)).map((score) => (
                <ScoreSongRow key={score.score_sid} score={score} />
              ))}
            </div>
            <div className="py-2 xl:pl-6">
              {scores.slice(Math.ceil(scores.length / 2)).map((score) => (
                <ScoreSongRow key={score.score_sid} score={score} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (chartListStyle) {
    const heroImageSrc = '/img/_common/whoOnlyonemusic_2.png';
    const heroImageClass = 'object-cover object-center';

    return (
      <div className="min-h-[50vh] bg-background">
        <section className="relative isolate min-h-[270px] overflow-hidden border-b border-white/[0.06]">
          <Image
            src={heroImageSrc}
            alt=""
            fill
            className={heroImageClass}
            sizes="(min-width: 1440px) 1440px, 100vw"
            priority
          />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/50" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-transparent to-black/40"
            aria-hidden
          />

          <div className="hero-media-on-dark relative z-10 mx-auto flex max-w-pc flex-col items-center px-4 py-7 text-center sm:px-6 md:py-9">
            {chartHeroTitle}
            <div className="mx-auto mt-5 flex w-full max-w-xl justify-center md:mt-6">
              <HeroSearchPill initialQuery={searchParams.get('q') ?? ''} className="w-full" />
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border-subtle)] bg-surface">
          <div className="mx-auto max-w-pc px-4 pt-6 sm:px-6 md:pt-8">
            {chartToolbarFilters}
          </div>
          <div className="mx-auto max-w-pc px-4 pb-10 sm:px-6 md:pb-14">
            <div className="min-w-0">{listBody}</div>

            {!loading && total > 0 && (
              <nav className="mt-12 flex flex-wrap justify-center gap-2" aria-label="페이지">
                <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-2 p-0">
                  {prev && page > 1 && (
                    <li>
                      <button type="button" onClick={() => goPage(page - 1)} className={pageBtn}>
                        « Prev
                      </button>
                    </li>
                  )}
                  {pages.map((n) => (
                    <li key={n}>
                      {n === page ? (
                        <span className={pageBtnActive} aria-current="page">
                          {n}
                        </span>
                      ) : (
                        <button type="button" onClick={() => goPage(n)} className={pageBtn}>
                          {n}
                        </button>
                      )}
                    </li>
                  ))}
                  {next && (
                    <li>
                      <button type="button" onClick={() => goPage(page + 1)} className={pageBtn}>
                        Next »
                      </button>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] bg-background">
      <section className="border-b border-[var(--border-subtle)] bg-surface-muted">
        <div className="mx-auto max-w-pc px-4 py-12 sm:px-6 md:py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12 xl:gap-16">
            {titleBlock}
            {filterBlock}
          </div>

          {heroSearch}
        </div>
      </section>

      <div className="mx-auto max-w-pc px-4 py-10 sm:px-6 md:py-14">
        <div className="min-w-0">{listBody}</div>

        {!loading && total > 0 && (
          <nav className="mt-12 flex flex-wrap justify-center gap-2" aria-label="페이지">
            <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-2 p-0">
              {prev && page > 1 && (
                <li>
                  <button type="button" onClick={() => goPage(page - 1)} className={pageBtn}>
                    « Prev
                  </button>
                </li>
              )}
              {pages.map((n) => (
                <li key={n}>
                  {n === page ? (
                    <span className={pageBtnActive} aria-current="page">
                      {n}
                    </span>
                  ) : (
                    <button type="button" onClick={() => goPage(n)} className={pageBtn}>
                      {n}
                    </button>
                  )}
                </li>
              ))}
              {next && (
                <li>
                  <button type="button" onClick={() => goPage(page + 1)} className={pageBtn}>
                    Next »
                  </button>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FilterOptions } from '@/lib/scoresApi';

export type ScoreFilterLayout = 'stack' | 'toolbar';

interface Props {
  filters: FilterOptions;
  /** stack: 세로(기본) · toolbar: 악보형식 → 정렬 → 언어 → 조 가로 배치 */
  layout?: ScoreFilterLayout;
  /** true면 검색 입력 숨김 */
  hideSearch?: boolean;
  /** 목록 페이지 경로 (기본 `/scores`, 형식 전용 `/scoresType`) */
  basePath?: string;
  /** 설정 시 `type` 쿼리를 비우는 동작을 막고, 초기화 시에만 유지 */
  preserveTypeCode?: string;
  /** 카테고리 URL 등: `basePath`만으로 초기화 (쿼리 제거) */
  preserveCategoryBasePath?: boolean;
}

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'popular', label: '인기순' },
];

/** 비활성만 — 활성과 className을 합치지 말 것(pillBase의 hover 글자색이 활성 배경에서 덮어씀) */
const pillInactive =
  'text-xs px-2.5 py-1.5 rounded-full border border-[var(--border-strong)] text-text-secondary transition hover:border-accent-teal/35 hover:bg-surface-muted hover:text-text-primary';

const pillActive =
  'text-xs px-2.5 py-1.5 rounded-full border border-accent-teal bg-accent-teal font-medium text-white shadow-sm transition hover:border-accent-teal-hover hover:bg-accent-teal-hover hover:text-white';

const labelClass = 'mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted';

export default function ScoreFilter({
  filters,
  layout = 'stack',
  hideSearch = false,
  basePath = '/scores',
  preserveTypeCode,
  preserveCategoryBasePath,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const current = {
    q: params.get('q') ?? '',
    music_sid: params.get('music_sid') ?? '',
    type: params.get('type') ?? '',
    language: params.get('language') ?? '',
    chord: params.get('chord') ?? '',
    sort: params.get('sort') ?? 'newest',
  };

  const pushWithBase = (next: URLSearchParams) => {
    const q = next.toString();
    if (!q) {
      router.push(basePath);
      return;
    }
    router.push(basePath.includes('?') ? `${basePath}&${q}` : `${basePath}?${q}`);
  };

  const updateParam = (key: string, value: string) => {
    if (preserveTypeCode && key === 'type' && !value) {
      return;
    }
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    pushWithBase(next);
  };

  const reset = () => {
    if (preserveCategoryBasePath) {
      router.push(basePath);
      return;
    }
    if (preserveTypeCode) {
      pushWithBase(new URLSearchParams({ type: preserveTypeCode }));
    } else {
      router.push(basePath);
    }
  };

  const hasFilter = preserveCategoryBasePath
    ? Boolean(
        current.type ||
          current.language ||
          current.chord ||
          current.music_sid ||
          (!hideSearch && current.q) ||
          current.sort !== 'newest',
      )
    : preserveTypeCode
      ? Boolean(
          current.language ||
            current.chord ||
            current.music_sid ||
            (!hideSearch && current.q) ||
            current.sort !== 'newest',
        )
      : Boolean(
          current.type ||
            current.language ||
            current.chord ||
            current.music_sid ||
            (!hideSearch && current.q),
        );

  const searchBlock = !hideSearch && (
    <div>
      <p className={labelClass}>검색</p>
      <input
        type="text"
        placeholder="곡명, 작곡가…"
        defaultValue={current.q}
        onKeyDown={(e) => {
          if (e.key === 'Enter') updateParam('q', (e.target as HTMLInputElement).value);
        }}
        className="w-full rounded-lg border border-[var(--border-strong)] bg-surface-muted px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/15"
      />
    </div>
  );

  const typeBlock = (
    <div className="min-w-0 shrink-0">
      <p className={labelClass}>악보 형식</p>
      <div className="flex flex-wrap gap-1.5">
        {filters.score_types.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => updateParam('type', current.type === opt.code ? '' : opt.code)}
            className={current.type === opt.code ? pillActive : pillInactive}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );

  const sortBlock = (
    <div className="min-w-0 shrink-0">
      <p className={labelClass}>정렬</p>
      <div className="flex flex-wrap gap-1.5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateParam('sort', opt.value)}
            className={current.sort === opt.value ? pillActive : pillInactive}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const languageBlock = (
    <div className="min-w-0 shrink-0">
      <p className={labelClass}>언어</p>
      <div className="flex flex-wrap gap-1.5">
        {filters.languages.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => updateParam('language', current.language === opt.code ? '' : opt.code)}
            className={current.language === opt.code ? pillActive : pillInactive}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );

  const chordBlock = (
    <div className="min-w-0 flex-1">
      <p className={labelClass}>조 (Key)</p>
      <div className="flex flex-wrap gap-1.5">
        {filters.chords.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => updateParam('chord', current.chord === opt.code ? '' : opt.code)}
            className={current.chord === opt.code ? pillActive : pillInactive}
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );

  if (layout === 'toolbar') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-6 xl:flex-row xl:flex-wrap xl:items-start xl:gap-x-10 xl:gap-y-5">
          {typeBlock}
          {sortBlock}
          {languageBlock}
          {chordBlock}
        </div>
        {hasFilter && (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-text-muted underline-offset-2 hover:text-text-secondary hover:underline"
          >
            필터 초기화
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {searchBlock}

      {sortBlock}

      {typeBlock}

      {languageBlock}

      {chordBlock}

      {hasFilter && (
        <button
          type="button"
          onClick={reset}
          className="text-xs text-text-muted underline-offset-2 hover:text-text-secondary hover:underline"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
}

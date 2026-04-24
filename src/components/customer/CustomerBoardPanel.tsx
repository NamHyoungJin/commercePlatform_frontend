'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  CustomerBoardDetail,
  CustomerBoardKey,
  CustomerBoardListItem,
  CustomerBoardListResponse,
} from '@/lib/customerBoardApi';
import { deleteCustomerQnaPost, getCustomerBoardDetail, getCustomerBoardList } from '@/lib/customerBoardApi';
import { memberOwnsQnaPost } from '@/components/customer/qnaOwnership';
import { useAuthStore } from '@/store/authStore';
import { LIST_PAGINATION_ACTIVE_SURFACE_CLASS } from '@/lib/listPaginationClasses';

/** CURSOR_RULES.md: 상세·필터는 쿼리(`?id=`, `?page=`, `?q=`)로만 처리 */
function buildBoardQuery(opts: { id?: string; page?: number; q?: string }): string {
  const u = new URLSearchParams();
  if (opts.id) {
    u.set('id', opts.id);
    if (opts.q) u.set('q', opts.q);
    return u.toString() ? `?${u}` : '';
  }
  if (opts.page && opts.page > 1) u.set('page', String(opts.page));
  if (opts.q) u.set('q', opts.q);
  return u.toString() ? `?${u}` : '';
}

function formatListDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

function formatDetailDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' });
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex min-h-[2.75rem] cursor-not-allowed items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-surface-muted/50 px-4 py-2 text-[15px] text-text-muted sm:text-base">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg border border-[var(--border-strong)] bg-surface px-4 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary sm:text-base"
    >
      {children}
    </Link>
  );
}

function CustomerBoardListEmpty({
  boardKey,
  authReady,
  isAuthenticated,
}: {
  boardKey: CustomerBoardKey;
  authReady: boolean;
  isAuthenticated: boolean;
}) {
  if (boardKey === 'qna' && authReady && !isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <p className="text-text-secondary">Q&amp;A 목록은 로그인 후 본인이 작성한 글만 표시됩니다.</p>
        <Link
          href={`/login?redirect=${encodeURIComponent('/customer/qna')}`}
          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-[#2ca7e1] px-5 py-2.5 text-base font-semibold text-white hover:bg-[#2496cc]"
        >
          로그인
        </Link>
      </div>
    );
  }
  if (boardKey === 'qna') return '작성한 문의가 없습니다.';
  return '등록된 글이 없습니다.';
}

/** 공지·FAQ·QNA — 상단 검색(검색어+검색) UI 없음(QNA는 하단 글쓰기만 유지) */
function showCustomerBoardSearchAndBulk(boardKey: CustomerBoardKey): boolean {
  return boardKey !== 'notice' && boardKey !== 'faq' && boardKey !== 'qna';
}

/** Tailwind `md`와 동일 — 768px 미만이면 모바일(카드·무한스크롤) */
function useViewportMinWidthMd(): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  return matches;
}

export function CustomerBoardPanel({ boardKey, boardPath }: { boardKey: CustomerBoardKey; boardPath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const member = useAuthStore((s) => s.member);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const authReady = useAuthStore((s) => s.authReady);
  const [deleting, setDeleting] = useState(false);
  const base = `/customer/${boardPath}`;

  const id = (searchParams.get('id') || '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const q = (searchParams.get('q') || '').trim();

  const [listState, setListState] = useState<
    'idle' | 'loading' | 'error' | { data: CustomerBoardListResponse }
  >('idle');
  const [detailState, setDetailState] = useState<
    'idle' | 'loading' | 'error' | 'notfound' | { post: CustomerBoardDetail }
  >('idle');

  const desktop = useViewportMinWidthMd();
  const [mobileRows, setMobileRows] = useState<CustomerBoardListItem[]>([]);
  const [mobileCount, setMobileCount] = useState(0);
  const [mobileTotalPages, setMobileTotalPages] = useState(1);
  const [mobileLastPage, setMobileLastPage] = useState(0);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileLoadingMore, setMobileLoadingMore] = useState(false);
  const [mobileError, setMobileError] = useState(false);
  const mobileSentinelRef = useRef<HTMLDivElement | null>(null);
  const mobileMetaRef = useRef({ lastPage: 0, totalPages: 1, loadingMore: false });
  mobileMetaRef.current = {
    lastPage: mobileLastPage,
    totalPages: mobileTotalPages,
    loadingMore: mobileLoadingMore,
  };

  useEffect(() => {
    if (!id) {
      setDetailState('idle');
      return;
    }
    setListState('idle');
    setDetailState('loading');
    let cancelled = false;
    (async () => {
      try {
        const post = await getCustomerBoardDetail(boardKey, id);
        if (cancelled) return;
        if (!post) setDetailState('notfound');
        else setDetailState({ post });
      } catch {
        if (!cancelled) setDetailState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boardKey, id]);

  useEffect(() => {
    if (id) return;
    if (desktop !== true) return;
    setListState('loading');
    let cancelled = false;
    (async () => {
      try {
        const data = await getCustomerBoardList(boardKey, { page, q: q || undefined, pageSize: 10 });
        if (!cancelled) setListState({ data });
      } catch {
        if (!cancelled) setListState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boardKey, id, desktop, page, q, authReady, isAuthenticated]);

  useEffect(() => {
    if (id) return;
    if (desktop !== false) return;
    let cancelled = false;
    setMobileLoading(true);
    setMobileError(false);
    setMobileRows([]);
    setMobileLastPage(0);
    setMobileTotalPages(1);
    setMobileCount(0);
    (async () => {
      try {
        const data = await getCustomerBoardList(boardKey, { page: 1, q: q || undefined, pageSize: 10 });
        if (cancelled) return;
        setMobileRows(data.results);
        setMobileCount(data.count);
        setMobileTotalPages(data.total_pages);
        setMobileLastPage(1);
      } catch {
        if (!cancelled) setMobileError(true);
      } finally {
        if (!cancelled) setMobileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [boardKey, id, desktop, q, authReady, isAuthenticated]);

  useEffect(() => {
    if (id) return;
    if (desktop !== false) return;
    if (mobileLoading || mobileError) return;
    if (mobileLastPage < 1) return;
    const el = mobileSentinelRef.current;
    if (!el) return;
    const { lastPage, totalPages } = mobileMetaRef.current;
    if (lastPage >= totalPages) return;

    let disposed = false;
    const obs = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting || disposed) return;
        const meta = mobileMetaRef.current;
        if (meta.loadingMore || meta.lastPage >= meta.totalPages) return;
        const next = meta.lastPage + 1;
        mobileMetaRef.current.loadingMore = true;
        setMobileLoadingMore(true);
        try {
          const data = await getCustomerBoardList(boardKey, { page: next, q: q || undefined, pageSize: 10 });
          if (disposed) return;
          setMobileRows((prev) => [...prev, ...data.results]);
          setMobileLastPage(next);
          setMobileTotalPages(data.total_pages);
        } catch {
          /* 스크롤 시 재시도 가능 */
        } finally {
          if (!disposed) {
            mobileMetaRef.current.loadingMore = false;
            setMobileLoadingMore(false);
          }
        }
      },
      { root: null, rootMargin: '120px', threshold: 0 },
    );
    obs.observe(el);
    return () => {
      disposed = true;
      obs.disconnect();
    };
  }, [boardKey, id, desktop, mobileLoading, mobileError, mobileLastPage, mobileTotalPages, q]);

  const goList = useCallback(
    (keepQ?: boolean) => {
      const qs = buildBoardQuery({ q: keepQ ? q : undefined });
      router.push(`${base}${qs}`);
    },
    [router, base, q],
  );

  if (id) {
    if (detailState === 'loading' || detailState === 'idle') {
      return <div className="py-16 text-center text-base text-text-muted">불러오는 중…</div>;
    }
    if (detailState === 'error') {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-[15px] leading-relaxed text-amber-950">
          본문을 불러오지 못했습니다. API 서버(NEXT_PUBLIC_API_URL)와 네트워크를 확인해 주세요.
        </div>
      );
    }
    if (detailState === 'notfound') {
      return (
        <div className="space-y-4">
          <p className="text-base text-text-secondary">존재하지 않는 게시글입니다.</p>
          <button
            type="button"
            onClick={() => goList(true)}
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-[#2ca7e1] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#2496cc]"
          >
            목록
          </button>
        </div>
      );
    }

    const { post } = detailState;
    const canEditQna =
      boardKey === 'qna' && isAuthenticated && member != null && memberOwnsQnaPost(post, member);

    return (
      <article className="space-y-6">
        <header className="border-b border-[var(--border-strong)] pb-4">
          <h2 className="text-balance text-[25px] font-bold leading-snug tracking-tight text-text-primary">
            {post.notify_flag === 'Y' ? <span className="text-orange-700">[공지] </span> : null}
            {post.subject || '(제목 없음)'}
          </h2>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-muted">
            <div>
              <dt className="inline">글쓴이 </dt>
              <dd className="inline text-text-primary">{post.author || '—'}</dd>
            </div>
            <div>
              <dt className="inline">날짜 </dt>
              <dd className="inline text-text-primary">{formatDetailDate(post.write_datetime)}</dd>
            </div>
            <div>
              <dt className="inline">조회 </dt>
              <dd className="inline text-text-primary">{post.hit}</dd>
            </div>
          </dl>
        </header>
        <div
          className="prose prose-neutral max-w-none text-base leading-relaxed text-text-secondary prose-p:leading-relaxed prose-p:text-base prose-p:text-text-secondary prose-a:text-[#2ca7e1] prose-headings:text-text-primary prose-li:text-base [&_*]:text-base"
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />
        <div className="flex flex-wrap gap-2 border-t border-[var(--border-strong)] pt-4">
          <button
            type="button"
            onClick={() => goList(true)}
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-[#2ca7e1] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#2496cc]"
          >
            목록
          </button>
          {canEditQna ? (
            <>
              <Link
                href={`${base}/write?id=${encodeURIComponent(id)}`}
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg border border-[#2ca7e1] bg-surface px-4 py-2.5 text-base font-semibold text-[#2ca7e1] transition-colors hover:bg-[#2ca7e1]/10"
              >
                수정
              </Link>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  if (!window.confirm('이 글을 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.')) return;
                  setDeleting(true);
                  try {
                    await deleteCustomerQnaPost(id);
                    goList(true);
                  } catch {
                    window.alert('삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.');
                  } finally {
                    setDeleting(false);
                  }
                }}
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg border border-red-600 bg-surface px-4 py-2.5 text-base font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? '삭제 중…' : '삭제'}
              </button>
            </>
          ) : null}
        </div>
      </article>
    );
  }

  if (desktop === null) {
    return <div className="py-16 text-center text-base text-text-muted">불러오는 중…</div>;
  }

  if (desktop === false) {
    if (mobileError) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-[15px] leading-relaxed text-amber-950">
          게시글을 불러오지 못했습니다. API 서버 주소(NEXT_PUBLIC_API_URL)와 DB 연결을 확인해 주세요.
        </div>
      );
    }
    if (mobileLoading && mobileRows.length === 0) {
      return <div className="py-16 text-center text-base text-text-muted">불러오는 중…</div>;
    }
  }

  if (desktop === true) {
    if (listState === 'loading' || listState === 'idle') {
      return <div className="py-16 text-center text-base text-text-muted">불러오는 중…</div>;
    }
    if (listState === 'error') {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-[15px] leading-relaxed text-amber-950">
          게시글을 불러오지 못했습니다. API 서버 주소(NEXT_PUBLIC_API_URL)와 DB 연결을 확인해 주세요.
        </div>
      );
    }
  }

  const deskData = desktop === true && listState !== 'idle' && listState !== 'loading' && listState !== 'error' ? listState.data : null;
  const count = desktop === true && deskData ? deskData.count : mobileCount;
  const page_size = desktop === true && deskData ? deskData.page_size : 10;
  const total_pages = desktop === true && deskData ? deskData.total_pages : 0;
  const results = desktop === true && deskData ? deskData.results : mobileRows;
  const offset = desktop === true ? (page - 1) * page_size : 0;

  const listToolbar = (
    <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-x-3 sm:gap-y-0">
      <div className="flex justify-start justify-self-start">
        <Link
          href={base}
          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-[#2ca7e1] px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-[#2496cc] sm:text-base"
        >
          목록
        </Link>
      </div>
      {desktop === true && deskData ? (
        <nav
          className="hidden flex-wrap items-center justify-center gap-3 justify-self-center text-[15px] text-text-muted sm:flex sm:text-base"
          aria-label="페이지"
        >
          <PageLink href={`${base}${buildBoardQuery({ page: 1, q })}`} disabled={page <= 1}>
            처음으로
          </PageLink>
          <PageLink href={`${base}${buildBoardQuery({ page: page - 1, q })}`} disabled={page <= 1}>
            이전
          </PageLink>
          <span
            className={`inline-flex min-h-[2.75rem] items-center rounded-lg px-3 font-medium tabular-nums ${LIST_PAGINATION_ACTIVE_SURFACE_CLASS}`}
          >
            {page}
          </span>
          <PageLink href={`${base}${buildBoardQuery({ page: page + 1, q })}`} disabled={page >= total_pages}>
            다음
          </PageLink>
          <PageLink href={`${base}${buildBoardQuery({ page: total_pages, q })}`} disabled={page >= total_pages}>
            맨끝으로
          </PageLink>
        </nav>
      ) : (
        <div className="hidden min-h-0 min-w-0 sm:block" aria-hidden />
      )}
      {showCustomerBoardSearchAndBulk(boardKey) ? (
        <form
          action={base}
          method="get"
          className="flex flex-wrap items-center justify-center gap-2 justify-self-center sm:justify-self-end"
        >
          <input type="hidden" name="page" value="1" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="검색어"
            className="min-w-[12rem] rounded-md border border-[var(--border-strong)] bg-surface-muted px-3 py-2 text-[15px] text-text-primary placeholder:text-text-muted focus:border-[#2ca7e1] focus:outline-none focus:ring-2 focus:ring-[#2ca7e1]/20 sm:text-base"
          />
          <button
            type="submit"
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-[#2ca7e1] px-4 py-2.5 text-base font-semibold text-white hover:bg-[#2496cc]"
          >
            검색
          </button>
        </form>
      ) : boardKey === 'qna' && authReady && isAuthenticated ? (
        <div className="flex justify-end justify-self-center sm:justify-self-end">
          <Link
            href={`${base}/write`}
            className="inline-flex min-h-[2.75rem] items-center justify-center rounded-lg bg-[#2ca7e1] px-4 py-2.5 text-[15px] font-semibold text-white hover:bg-[#2496cc] sm:text-base"
          >
            글쓰기
          </Link>
        </div>
      ) : (
        <div className="hidden min-h-0 min-w-0 sm:block" aria-hidden />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 모바일: 가로 스크롤 없이 2줄 카드 + 하단에서 추가 로드 */}
      {desktop === false ? (
        <div className="overflow-hidden rounded-xl border-x-0 border-b border-t border-solid border-[var(--border-strong)] bg-surface md:hidden">
          {mobileRows.length === 0 && !mobileLoading ? (
            <div className="px-4 py-16 text-center text-base text-text-muted">
              <CustomerBoardListEmpty boardKey={boardKey} authReady={authReady} isAuthenticated={isAuthenticated} />
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border-subtle)]">
              {mobileRows.map((row, idx) => {
                const listNo = mobileCount - idx;
                const href = `${base}?${new URLSearchParams({ id: String(row.hj_board_sid) }).toString()}`;
                const title =
                  row.secret_flag === 'Y' ? `[비밀글] ${row.subject || '(제목 없음)'}` : row.subject || '(제목 없음)';
                return (
                  <li key={`${row.hj_board_sid}-${idx}`} className="px-3 py-3">
                    <Link href={href} className="block min-w-0">
                      <div className="break-words text-[15px] font-semibold leading-snug text-text-primary underline-offset-2 sm:text-base">
                        {row.notify_flag === 'Y' ? <span className="text-orange-700">[공지] </span> : null}
                        {title}
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs tabular-nums text-text-muted sm:text-[13px]">
                        <span>번호 {listNo}</span>
                        <span className="min-w-0 break-words text-text-secondary">글쓴이 {row.author || '—'}</span>
                        <span>{formatListDate(row.write_datetime)}</span>
                        <span>조회 {row.hit}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {mobileRows.length > 0 && mobileLastPage < mobileTotalPages ? (
            <div ref={mobileSentinelRef} className="h-8 w-full shrink-0" aria-hidden />
          ) : null}
          {mobileLoadingMore ? (
            <div className="border-t border-[var(--border-subtle)] py-3 text-center text-sm text-text-muted">불러오는 중…</div>
          ) : null}
        </div>
      ) : null}

      {/* 데스크톱: 기존 테이블 + URL 페이지네이션 */}
      {desktop === true && deskData ? (
        <div className="hidden overflow-hidden rounded-xl border-x-0 border-b border-t border-solid border-[var(--border-strong)] bg-surface md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 border-0 text-left text-[15px] leading-snug text-text-secondary sm:text-base">
              <thead>
                <tr className="bg-surface-muted text-[13px] font-semibold uppercase tracking-wide text-text-muted sm:text-[15px]">
                  <th className="w-14 border-0 border-b border-solid border-[var(--border-strong)] px-3 py-3 md:py-4">번호</th>
                  <th className="border-0 border-b border-solid border-[var(--border-strong)] px-3 py-3 md:py-4">제목</th>
                  <th className="w-28 border-0 border-b border-solid border-[var(--border-strong)] px-3 py-3 md:py-4">글쓴이</th>
                  <th className="w-28 border-0 border-b border-solid border-[var(--border-strong)] px-3 py-3 md:py-4">날짜</th>
                  <th className="w-20 border-0 border-b border-solid border-[var(--border-strong)] px-3 py-3 text-right md:py-4">
                    조회
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="border-0 border-b border-solid border-[var(--border-subtle)] px-4 py-16 text-center text-base text-text-muted"
                    >
                      <CustomerBoardListEmpty boardKey={boardKey} authReady={authReady} isAuthenticated={isAuthenticated} />
                    </td>
                  </tr>
                ) : (
                  results.map((row, idx) => {
                    const listNo = count - offset - idx;
                    const href = `${base}?${new URLSearchParams({ id: String(row.hj_board_sid) }).toString()}`;
                    const title =
                      row.secret_flag === 'Y' ? `[비밀글] ${row.subject || '(제목 없음)'}` : row.subject || '(제목 없음)';
                    return (
                      <tr key={row.hj_board_sid} className="transition hover:bg-surface-muted/70">
                        <td className="border-0 border-b border-solid border-[var(--border-subtle)] px-3 py-3 tabular-nums text-sm text-text-muted sm:py-4 sm:text-[15px]">
                          {listNo}
                        </td>
                        <td className="max-w-[1px] border-0 border-b border-solid border-[var(--border-subtle)] px-3 py-3 md:py-4">
                          <Link
                            href={href}
                            className="group block truncate font-semibold text-text-primary underline-offset-2 transition-colors hover:text-[#2ca7e1] hover:underline"
                            title={title}
                          >
                            <span>
                              {row.notify_flag === 'Y' ? <span className="text-orange-700">[공지] </span> : null}
                              {title}
                            </span>
                          </Link>
                        </td>
                        <td className="border-0 border-b border-solid border-[var(--border-subtle)] px-3 py-3 text-[15px] text-text-secondary sm:py-4 sm:text-base">
                          {row.author}
                        </td>
                        <td className="border-0 border-b border-solid border-[var(--border-subtle)] px-3 py-3 tabular-nums text-sm text-text-muted sm:py-4 sm:text-[15px]">
                          {formatListDate(row.write_datetime)}
                        </td>
                        <td className="border-0 border-b border-solid border-[var(--border-subtle)] px-3 py-3 text-right tabular-nums text-sm text-text-muted sm:py-4 sm:text-[15px]">
                          {row.hit}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {listToolbar}
    </div>
  );
}

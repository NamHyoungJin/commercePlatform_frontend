'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { wishApi } from '@/lib/wishApi';
import type { Score } from '@/lib/scoresApi';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';
import { MypageChevronLeftIcon, MypageChevronRightIcon, MypageTrashIcon } from '@/components/mypage/mypageActionIcons';
import ScoreListPricePill from '@/components/scores/ScoreListPricePill';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
type Row = Score & { wish_reg_datetime?: string | null };

/** 데스크톱: 번호 | 썸네일 | 곡정보 | 금액 | 장바구니 | 삭제 — 모바일은 flex 2줄(제목줄 / 버튼줄), 썸네일 숨김 */
const wishRowShellClass =
  'flex flex-col gap-2 border-b border-[var(--border-subtle)] px-3 py-3 last:border-b-0 text-text-primary transition-colors hover:bg-surface-muted/80 md:grid md:grid-cols-[52px_7.5rem_minmax(0,1fr)_7.25rem_minmax(8rem,auto)_minmax(5.25rem,auto)] md:items-center md:gap-4 md:px-4 md:py-5';
const wishHeaderShellClass =
  'flex flex-col gap-2 border-b border-[var(--border-subtle)] bg-surface-muted px-3 py-3 text-[13px] font-semibold uppercase tracking-wide text-text-muted last:border-b-0 sm:text-[15px] md:grid md:grid-cols-[52px_7.5rem_minmax(0,1fr)_7.25rem_minmax(8rem,auto)_minmax(5.25rem,auto)] md:items-center md:gap-4 md:px-4 md:py-4';

export default function MypageWishClient() {
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [removeDialogSid, setRemoveDialogSid] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await wishApi.list(p);
      setCount(data.count);
      setPage(data.page);
      setPageSize(data.page_size);
      setRows(data.results);
    } catch (e) {
      setError(axios.isAxiosError(e) ? formatApiErrorMessage(e.response?.data) : '목록을 불러오지 못했습니다.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(page);
  }, [load, page]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const startNo = count === 0 ? 0 : (page - 1) * pageSize + 1;

  const confirmRemoveFromWish = async () => {
    if (removeDialogSid === null) return;
    const scoreSid = removeDialogSid;
    setRemoving(scoreSid);
    setError(null);
    try {
      await wishApi.remove(scoreSid);
      setRemoveDialogSid(null);
      if (rows.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await load(page);
      }
    } catch (e) {
      setError(axios.isAxiosError(e) ? formatApiErrorMessage(e.response?.data) : '삭제에 실패했습니다.');
    } finally {
      setRemoving(null);
    }
  };

  const dialogWishRow = removeDialogSid ? rows.find((r) => r.score_sid === removeDialogSid) : null;
  const dialogWishTitle = dialogWishRow ? dialogWishRow.music?.kor_name || dialogWishRow.title : null;

  if (loading && rows.length === 0 && !error) {
    return <p className="text-base text-text-muted">보관함을 불러오는 중…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-[15px] leading-relaxed text-red-900" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border-x-0 border-b border-t border-solid border-[var(--border-strong)] bg-surface text-[15px] leading-snug sm:text-base">
        {/* 헤더 */}
        <div className={wishHeaderShellClass} role="row">
          <div className="flex min-w-0 items-start gap-2 md:contents">
            <div className="w-9 shrink-0 text-center md:col-start-1 md:row-start-1 md:w-auto" role="columnheader">
              번호
            </div>
            <div
              className="hidden shrink-0 justify-center text-center md:col-start-2 md:row-start-1 md:flex"
              role="columnheader"
            >
              보기
            </div>
            <div className="min-w-0 flex-1 pl-0 md:col-start-3 md:row-start-1 md:flex-1 md:pl-4" role="columnheader">
              곡정보
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 md:contents">
            <div className="md:col-start-4 md:row-start-1 md:flex md:w-full md:justify-end" role="columnheader">
              금액
            </div>
            <div className="text-center md:col-start-5 md:row-start-1" role="columnheader">
              장바구니
            </div>
            <div className="text-center md:col-start-6 md:row-start-1" role="columnheader">
              삭제
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-base text-text-muted">보관된 악보가 없습니다.</div>
        ) : (
          <div role="list">
            {rows.map((row, i) => {
              const no = startNo + i;
              const detailHref = `/scores?sid=${encodeURIComponent(row.score_sid)}`;
              const subline = [row.score_type_name, row.chord_name, row.chord_scales_name].filter(Boolean).join(' · ');
              return (
                <div key={row.score_sid} className={wishRowShellClass} role="listitem">
                  <div className="flex min-w-0 items-start gap-2 md:contents">
                    <div className="w-9 shrink-0 self-start text-center text-sm text-text-muted tabular-nums sm:w-auto sm:text-[15px] md:col-start-1 md:row-start-1">
                      {no}
                    </div>
                    <div className="hidden shrink-0 justify-center md:col-start-2 md:row-start-1 md:flex">
                      {row.thumbnail_url ? (
                        <Link
                          href={detailHref}
                          className="relative inline-flex h-[4.5rem] w-[6.75rem] shrink-0 overflow-hidden rounded-md border border-solid border-[color:var(--border-strong)] bg-surface-muted ring-0 sm:h-20 sm:w-[7.5rem]"
                          title="악보 보기"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={row.thumbnail_url} alt="" className="h-full w-full object-cover" />
                        </Link>
                      ) : (
                        <Link
                          href={detailHref}
                          className="inline-flex min-h-[4.5rem] min-w-[6.75rem] items-center justify-center rounded-md border border-solid border-[color:var(--border-strong)] bg-surface-muted text-sm font-medium text-text-secondary underline decoration-[color:var(--border-strong)] underline-offset-2 hover:text-[#2ca7e1] sm:min-h-20 sm:min-w-[7.5rem] sm:text-[15px]"
                        >
                          보기
                        </Link>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pl-0 md:col-start-3 md:row-start-1 md:flex-1 md:pl-4">
                      <Link
                        href={detailHref}
                        className="group block font-semibold leading-snug text-text-primary hover:text-[#2ca7e1]"
                        title={row.music?.kor_name || row.title}
                      >
                        <span className="line-clamp-2 break-words text-[17px] underline decoration-transparent underline-offset-2 transition-colors group-hover:decoration-[#2ca7e1]/40 sm:text-lg md:text-xl">
                          {row.music?.kor_name || row.title}
                        </span>
                      </Link>
                      {subline ? (
                        <p
                          className="mt-1 line-clamp-2 text-[15px] leading-snug text-text-secondary sm:text-base"
                          title={subline}
                        >
                          {subline}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* 모바일: 금액 + 장바구니 + 삭제 한 줄 · 데스크톱: md:contents로 그리드 4~6열 */}
                  <div className="flex flex-wrap items-center justify-end gap-2 md:contents sm:gap-3">
                    <div className="shrink-0 md:hidden">
                      <ScoreListPricePill
                        amount={Number(row.price) || 0}
                        href={detailHref}
                        size="default"
                        layout="default"
                      />
                    </div>
                    <div className="hidden w-full justify-end md:col-start-4 md:row-start-1 md:flex md:w-full">
                      <ScoreListPricePill amount={Number(row.price) || 0} href={detailHref} size="large" layout="gridCellFixed" />
                    </div>
                    <div className="flex shrink-0 justify-center md:col-start-5 md:row-start-1">
                      <AddToCartButton
                        scoreSid={row.score_sid}
                        variant="neutralOutline"
                        label="장바구니 넣기"
                        labelClassName="max-md:sr-only"
                        className="max-md:min-h-[2.75rem] max-md:!w-[2.75rem] max-md:!max-w-[2.75rem] max-md:shrink-0 max-md:gap-0 max-md:!px-2.5"
                      />
                    </div>
                    <div className="flex shrink-0 justify-center md:col-start-6 md:row-start-1">
                      <button
                        type="button"
                        aria-label="삭제"
                        disabled={removing === row.score_sid || removeDialogSid !== null}
                        onClick={() => setRemoveDialogSid(row.score_sid)}
                        className="inline-flex min-h-[2.75rem] min-w-[5.25rem] items-center justify-center gap-2 rounded-md border border-red-200 bg-transparent px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 max-md:min-w-[2.75rem] max-md:px-2.5 sm:text-[15px]"
                      >
                        {removing === row.score_sid ? (
                          '…'
                        ) : (
                          <>
                            <MypageTrashIcon className="h-5 w-5 shrink-0 text-red-600" />
                            <span className="max-md:sr-only">삭제</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-3 text-[15px] sm:text-base">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-surface px-4 py-2 font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary disabled:opacity-40"
          >
            <MypageChevronLeftIcon className="h-5 w-5 shrink-0 text-text-muted" />
            이전
          </button>
          <span className="text-text-muted tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg border border-[var(--border-strong)] bg-surface px-4 py-2 font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary disabled:opacity-40"
          >
            <MypageChevronRightIcon className="h-5 w-5 shrink-0 text-text-muted" />
            다음
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        open={removeDialogSid !== null}
        title="보관함에서 삭제"
        message="이 악보를 보관함에서 삭제할까요? 나중에 다시 담을 수 있습니다."
        detail={dialogWishTitle}
        onCancel={() => {
          if (removing) return;
          setRemoveDialogSid(null);
        }}
        onConfirm={confirmRemoveFromWish}
        pending={removing !== null}
      />
    </div>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { cartApi, type CartLine } from '@/lib/cartApi';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';
import { MypageTrashIcon } from '@/components/mypage/mypageActionIcons';
import ScoreListPricePill from '@/components/scores/ScoreListPricePill';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import PayPalMarkIcon from '@/components/checkout/PayPalMarkIcon';

/** 데스크톱: 번호 | 썸네일 | 곡정보 | 금액 | 삭제 — 모바일은 제목줄 / (금액+삭제) 한 줄, 썸네일 숨김 (보관함 wish와 동일 패턴) */
const cartRowShellClass =
  'flex flex-col gap-2 border-b border-[var(--border-subtle)] px-3 py-3 last:border-b-0 text-text-primary transition-colors hover:bg-surface-muted/80 md:grid md:grid-cols-[52px_7.5rem_minmax(0,1fr)_7.25rem_minmax(5.25rem,auto)] md:items-center md:gap-4 md:px-4 md:py-5';
const cartHeaderShellClass =
  'flex flex-col gap-2 border-b border-[var(--border-subtle)] bg-surface-muted px-3 py-3 text-[13px] font-semibold uppercase tracking-wide text-text-muted last:border-b-0 sm:text-[15px] md:grid md:grid-cols-[52px_7.5rem_minmax(0,1fr)_7.25rem_minmax(5.25rem,auto)] md:items-center md:gap-4 md:px-4 md:py-4';

export default function MypageCartClient() {
  const [rows, setRows] = useState<CartLine[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [removeDialogLineId, setRemoveDialogLineId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await cartApi.list();
      setRows(data.results);
      setTotalPrice(data.total_price);
    } catch (e) {
      setError(axios.isAxiosError(e) ? formatApiErrorMessage(e.response?.data) : '장바구니를 불러오지 못했습니다.');
      setRows([]);
      setTotalPrice(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmRemoveFromCart = async () => {
    if (removeDialogLineId === null) return;
    const id = removeDialogLineId;
    setRemoving(id);
    setError(null);
    try {
      await cartApi.remove(id);
      setRemoveDialogLineId(null);
      await load();
    } catch (e) {
      setError(axios.isAxiosError(e) ? formatApiErrorMessage(e.response?.data) : '삭제에 실패했습니다.');
    } finally {
      setRemoving(null);
    }
  };

  const dialogCartRow = removeDialogLineId !== null ? rows.find((r) => r.id === removeDialogLineId) : null;
  const dialogCartTitle = dialogCartRow ? dialogCartRow.score.music?.kor_name || dialogCartRow.score.title : null;

  if (loading && rows.length === 0 && !error) {
    return <p className="text-base text-text-muted">장바구니를 불러오는 중…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-[15px] leading-relaxed text-red-900" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border-x-0 border-t border-solid border-[var(--border-strong)] bg-surface text-[15px] leading-snug sm:text-base">
        <div className={cartHeaderShellClass} role="row">
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
              삭제
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-base text-text-muted">장바구니가 비어 있습니다.</div>
        ) : (
          <div role="list">
            {rows.map((row, i) => {
              const sc = row.score;
              const detailHref = `/scores?sid=${encodeURIComponent(sc.score_sid)}`;
              const subline = [sc.score_type_name, sc.chord_name, sc.chord_scales_name].filter(Boolean).join(' · ');
              const unit = Number(sc.price) || 0;
              const lineTotal = unit * row.quantity;
              return (
                <div key={row.id} className={cartRowShellClass} role="listitem">
                  <div className="flex min-w-0 items-start gap-2 md:contents">
                    <div className="w-9 shrink-0 self-start text-center text-sm text-text-muted tabular-nums sm:w-auto sm:text-[15px] md:col-start-1 md:row-start-1">
                      {i + 1}
                    </div>
                    <div className="hidden shrink-0 justify-center md:col-start-2 md:row-start-1 md:flex">
                      {sc.thumbnail_url ? (
                        <Link
                          href={detailHref}
                          className="relative inline-flex h-[4.5rem] w-[6.75rem] shrink-0 overflow-hidden rounded-md border border-solid border-[color:var(--border-strong)] bg-surface-muted ring-0 sm:h-20 sm:w-[7.5rem]"
                          title="악보 보기"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sc.thumbnail_url} alt="" className="h-full w-full object-cover" />
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
                        title={sc.music?.kor_name || sc.title}
                      >
                        <span className="line-clamp-2 break-words text-[17px] underline decoration-transparent underline-offset-2 transition-colors group-hover:decoration-[#2ca7e1]/40 sm:text-lg md:text-xl">
                          {sc.music?.kor_name || sc.title}
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
                      {row.quantity > 1 ? (
                        <p className="mt-1 text-sm leading-snug text-text-secondary sm:text-[15px]">
                          수량 {row.quantity} · 단가 {unit.toLocaleString('ko-KR')}원
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 md:contents sm:gap-3">
                    <div className="shrink-0 md:hidden">
                      <ScoreListPricePill
                        amount={lineTotal}
                        href={detailHref}
                        size="default"
                        layout="default"
                      />
                    </div>
                    <div className="hidden w-full justify-end md:col-start-4 md:row-start-1 md:flex md:w-full">
                      <ScoreListPricePill amount={lineTotal} href={detailHref} size="large" layout="gridCellFixed" />
                    </div>
                    <div className="flex shrink-0 justify-center md:col-start-5 md:row-start-1">
                      <button
                        type="button"
                        aria-label="삭제"
                        disabled={removing === row.id || removeDialogLineId !== null}
                        onClick={() => setRemoveDialogLineId(row.id)}
                        className="inline-flex min-h-[2.75rem] min-w-[5.25rem] items-center justify-center gap-2 rounded-md border border-red-200 bg-transparent px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50 max-md:min-w-[2.75rem] max-md:px-2.5 sm:text-[15px]"
                      >
                        {removing === row.id ? (
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

      {rows.length > 0 ? (
        <div className="flex flex-row flex-wrap items-center justify-end gap-3 border-t border-[var(--border-strong)] pt-5 sm:gap-4">
          <span className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-2xl">합계 : </span>
          <span className="text-xl font-bold tabular-nums text-[#ea6a7c] sm:text-3xl">
            {totalPrice.toLocaleString('ko-KR')}
            <span className="font-semibold text-[#ea6a7c]">원</span>
          </span>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
            <Link
              href="/mypage/checkout"
              className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center rounded-md bg-[#2ca7e1] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:!text-white hover:bg-[#2496cc] focus-visible:!text-white sm:min-h-[3rem] sm:px-6 sm:text-[18px]"
            >
              일반결제하기
            </Link>
            <Link
              href="/mypage/checkout/paypal"
              className="inline-flex min-h-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-md border border-[#0070ba] bg-[#ffc439] px-4 py-2.5 text-center text-sm font-semibold text-[#003087] shadow-sm transition-colors hover:bg-[#f2bd38] sm:min-h-[3rem] sm:px-5 sm:text-[16px]"
              title="토스페이먼츠 결제위젯 PayPal (USD)"
            >
              <PayPalMarkIcon className="h-6 w-auto sm:h-7" />
              <span>PayPal 결제하기</span>
            </Link>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={removeDialogLineId !== null}
        title="장바구니에서 삭제"
        message="이 악보를 장바구니에서 삭제할까요? 보관함에 다시 담을 수 있습니다."
        detail={dialogCartTitle}
        onCancel={() => {
          if (removing !== null) return;
          setRemoveDialogLineId(null);
        }}
        onConfirm={confirmRemoveFromCart}
        pending={removing !== null}
      />
    </div>
  );
}

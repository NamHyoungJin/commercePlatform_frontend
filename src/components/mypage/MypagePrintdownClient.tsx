'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import axios from 'axios';
import { SampleScoreModalTrigger } from '@/components/modals/SampleScoreModal';
import {
  MODAL_CONTENT_BG,
  MODAL_TITLE_BAR,
  modalCloseButtonOnBarClass,
  modalTitleHeadingClass,
} from '@/components/modals/modalTitleBar';
import { printdownApi, type PrintdownRow } from '@/lib/printdownApi';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';
import {
  MypageChevronLeftIcon,
  MypageChevronRightIcon,
  MypagePrinterIcon,
  MypageSearchPlusIcon,
  MypageXIcon,
} from '@/components/mypage/mypageActionIcons';

/** 데스크톱: 번호 | 곡정보 | 구매·인쇄 기간 | 샘플 | 인쇄 — 모바일은 제목줄 / (샘플+인쇄) 한 줄(아이콘 위주), 기간은 곡정보 블록 안으로 (보관함 wish와 동일 패턴) */
const printRowShellClass =
  'flex flex-col gap-2 border-b border-[var(--border-subtle)] px-3 py-3 last:border-b-0 text-text-primary transition-colors hover:bg-surface-muted/80 md:grid md:grid-cols-[52px_minmax(0,1fr)_minmax(8rem,auto)_minmax(6.75rem,auto)_minmax(5.25rem,auto)] md:items-center md:gap-4 md:px-4 md:py-5';
const printHeaderShellClass =
  'flex flex-col gap-2 border-b border-[var(--border-subtle)] bg-surface-muted px-3 py-3 text-[13px] font-semibold uppercase tracking-wide text-text-muted last:border-b-0 sm:text-[15px] md:grid md:grid-cols-[52px_minmax(0,1fr)_minmax(8rem,auto)_minmax(6.75rem,auto)_minmax(5.25rem,auto)] md:items-center md:gap-4 md:px-4 md:py-4';

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso.slice(0, 10));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/** Chrome 등 내장 PDF 뷰어에서 색인·썸네일 패널·툴바 최소화(브라우저마다 적용 정도 상이) */
const PDF_IFRAME_VIEW_HASH = '#toolbar=0&navpanes=0&pagemode=none';

type PrintPhase = 'idle' | 'loading' | 'ready' | 'error';

type PrintModalState = {
  open: boolean;
  title: string;
  phase: PrintPhase;
  blobUrl: string | null;
  errorMsg: string;
};

const closedPrint: PrintModalState = {
  open: false,
  title: '',
  phase: 'idle',
  blobUrl: null,
  errorMsg: '',
};

export default function MypagePrintdownClient() {
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [rows, setRows] = useState<PrintdownRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printError, setPrintError] = useState<string | null>(null);
  const [openingPrintId, setOpeningPrintId] = useState<number | null>(null);
  const [printModal, setPrintModal] = useState<PrintModalState>(closedPrint);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const revokeBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const closePrintModal = useCallback(() => {
    revokeBlob();
    setPrintModal(closedPrint);
  }, [revokeBlob]);

  useEffect(() => {
    if (!printModal.open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePrintModal();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [printModal.open, closePrintModal]);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await printdownApi.list(p);
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

  const handlePrintClick = async (row: PrintdownRow) => {
    setPrintError(null);
    const titleText = row.music?.kor_name || row.title;
    setPrintModal({
      open: true,
      title: titleText,
      phase: 'loading',
      blobUrl: null,
      errorMsg: '',
    });
    setOpeningPrintId(row.mypage_print_sid);
    try {
      const { data } = await printdownApi.pdfUrl(row.mypage_print_sid);
      const pdfUrl = data.pdf_content_url;
      if (!pdfUrl) {
        throw new Error('PDF 주소를 받지 못했습니다.');
      }
      const res = await fetch(pdfUrl, { method: 'GET', mode: 'cors', credentials: 'omit' });
      if (!res.ok) {
        throw new Error(`PDF를 불러오지 못했습니다. (${res.status})`);
      }
      const blob = await res.blob();
      const pdfBlob = blob.type && blob.type.includes('pdf') ? blob : new Blob([blob], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(pdfBlob);
      revokeBlob();
      blobUrlRef.current = blobUrl;
      setPrintModal({
        open: true,
        title: titleText,
        phase: 'ready',
        blobUrl,
        errorMsg: '',
      });
    } catch (e) {
      revokeBlob();
      let errorMsg = 'PDF를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
      if (axios.isAxiosError(e) && e.response?.data !== undefined) {
        errorMsg = formatApiErrorMessage(e.response.data);
      } else if (e instanceof Error && e.message) {
        errorMsg = e.message;
      }
      setPrintModal({
        open: true,
        title: titleText,
        phase: 'error',
        blobUrl: null,
        errorMsg,
      });
    } finally {
      setOpeningPrintId(null);
    }
  };

  const runPrintDialog = useCallback(() => {
    const ifr = iframeRef.current;
    if (!ifr?.contentWindow) return;
    try {
      ifr.contentWindow.focus();
      ifr.contentWindow.print();
    } catch {
      setPrintError('브라우저에서 인쇄를 시작하지 못했습니다. PDF 뷰어 메뉴에서 인쇄를 선택해 보세요.');
    }
  }, []);

  if (loading && rows.length === 0 && !error) {
    return <p className="text-base text-text-muted">목록을 불러오는 중…</p>;
  }

  const printPortal =
    printModal.open && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="print-modal-title">
            <button type="button" className="absolute inset-0 bg-black/50" aria-label="닫기" onClick={closePrintModal} />
            <div
              className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-neutral-200 bg-[#fff] shadow-2xl ring-1 ring-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              <header
                className={`flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-5 ${MODAL_TITLE_BAR}`}
              >
                <h2
                  id="print-modal-title"
                  className={`min-w-0 text-xl tracking-tight sm:text-2xl ${modalTitleHeadingClass}`}
                >
                  악보 인쇄
                </h2>
                <button type="button" onClick={closePrintModal} className={modalCloseButtonOnBarClass} aria-label="닫기">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </header>
              <p
                className={`home-album-strip-sub popular-chart-section-sub shrink-0 border-b border-neutral-200 px-4 py-2.5 sm:px-5 ${MODAL_CONTENT_BG}`}
              >
                아래에서 미리 확인한 뒤, <strong className="font-semibold text-teal-700">프린터로 인쇄</strong>를 누르면 인쇄
                대화상자가 열립니다.
              </p>

              <div className={`min-h-0 flex-1 overflow-hidden ${MODAL_CONTENT_BG}`}>
                {printModal.phase === 'loading' ? (
                  <div className="flex min-h-[50vh] items-center justify-center text-base text-text-muted">PDF를 불러오는 중…</div>
                ) : null}
                {printModal.phase === 'error' ? (
                  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 text-center">
                    <p className="max-w-md text-[15px] leading-relaxed text-red-600">{printModal.errorMsg}</p>
                  </div>
                ) : null}
                {printModal.phase === 'ready' && printModal.blobUrl ? (
                  <iframe
                    ref={iframeRef}
                    title="악보 PDF"
                    src={`${printModal.blobUrl}${PDF_IFRAME_VIEW_HASH}`}
                    className="h-[min(72vh,720px)] w-full border-0 bg-white"
                  />
                ) : null}
              </div>

              <footer
                className={`flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-neutral-200 px-4 py-3 sm:px-5 ${MODAL_CONTENT_BG}`}
              >
                {printModal.phase === 'ready' ? (
                  <button
                    type="button"
                    onClick={runPrintDialog}
                    className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg bg-[#2ca7e1] px-4 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-[#2496cc]"
                  >
                    <MypagePrinterIcon className="h-5 w-5 shrink-0 text-white/95" />
                    프린터로 인쇄
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={closePrintModal}
                  className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-base font-medium text-neutral-800 hover:bg-neutral-50"
                >
                  <MypageXIcon className="h-5 w-5 shrink-0 text-neutral-500" />
                  닫기
                </button>
              </footer>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`flex flex-col gap-4 ${printModal.open ? 'pointer-events-none' : ''}`} aria-hidden={printModal.open || undefined}>
      <p className="max-w-4xl text-[15px] leading-relaxed text-text-secondary sm:text-base">
        구매하신 악보 중 인쇄·다운로드가 허용된 건만 표시됩니다.
      </p>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-[15px] leading-relaxed text-red-900" role="alert">
          {error}
        </p>
      )}

      {printError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[15px] leading-relaxed text-amber-950" role="alert">
          {printError}
          <button type="button" className="ml-2 font-medium text-[#2ca7e1] underline hover:text-[#2496cc]" onClick={() => setPrintError(null)}>
            닫기
          </button>
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border-x-0 border-b border-t border-solid border-[var(--border-strong)] bg-surface text-[15px] leading-snug sm:text-base">
        <div className={printHeaderShellClass} role="row">
          <div className="flex min-w-0 items-start gap-2 md:contents">
            <div className="w-9 shrink-0 text-center md:col-start-1 md:row-start-1 md:w-auto" role="columnheader">
              번호
            </div>
            <div className="min-w-0 flex-1 md:col-start-2 md:row-start-1 md:flex-1" role="columnheader">
              곡정보
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 md:contents">
            <div className="text-center md:col-start-3 md:row-start-1" role="columnheader">
              구매·인쇄 가능
            </div>
            <div className="text-center md:col-start-4 md:row-start-1" role="columnheader">
              보기
            </div>
            <div className="text-center md:col-start-5 md:row-start-1" role="columnheader">
              인쇄
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-base text-text-muted">인쇄·다운로드 가능한 악보가 없습니다.</div>
        ) : (
          <div role="list">
            {rows.map((row, i) => {
              const no = startNo + i;
              const detailHref = `/scores?sid=${encodeURIComponent(row.score_sid)}`;
              const subline = [row.score_type_name, row.chord_name, row.chord_scales_name].filter(Boolean).join(' · ');
              const sampleUrl = row.sample_image_url || row.thumbnail_url;
              const titleText = row.music?.kor_name || row.title;
              const atLimit = row.action_limit > 0 && row.action_count >= row.action_limit;
              const canPrint = row.action_flag === 'Y' && !atLimit;
              const limitLine =
                row.action_limit > 0 ? `${row.action_count} / ${row.action_limit}회` : `${row.action_count}회`;
              const periodInner = (
                <>
                  <span className="tabular-nums">{formatShortDate(row.print_start_date)}</span>
                  <span className="mx-0.5 text-text-muted">~</span>
                  <span className="tabular-nums">{formatShortDate(row.print_end_date)}</span>
                  <p className="mt-1 text-xs text-text-muted sm:text-sm">사용 {limitLine}</p>
                </>
              );

              return (
                <div key={row.mypage_print_sid} className={printRowShellClass} role="listitem">
                  <div className="flex min-w-0 items-start gap-2 md:contents">
                    <div className="w-9 shrink-0 self-start text-center text-sm text-text-muted tabular-nums sm:w-auto sm:text-[15px] md:col-start-1 md:row-start-1">
                      {no}
                    </div>
                    <div className="min-w-0 flex-1 md:col-start-2 md:row-start-1 md:flex-1">
                      <Link
                        href={detailHref}
                        className="group block font-semibold leading-snug text-text-primary hover:text-[#2ca7e1]"
                        title={titleText}
                      >
                        <span className="line-clamp-2 break-words text-[17px] underline decoration-transparent underline-offset-2 transition-colors group-hover:decoration-[#2ca7e1]/40 sm:text-lg md:text-xl">
                          {titleText}
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
                      {/* 모바일: 인쇄 기간·사용 횟수 왼쪽, 샘플·인쇄 버튼 오른쪽 한 줄 */}
                      <div className="mt-2 flex min-w-0 items-center justify-between gap-2 md:hidden">
                        <div className="min-w-0 flex-1 text-left text-sm leading-snug text-text-secondary sm:text-[15px]">
                          {periodInner}
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <SampleScoreModalTrigger
                            sampleImageUrl={sampleUrl}
                            title={titleText}
                            heading="샘플 보기"
                            ariaLabel="샘플 보기"
                            className="inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center gap-0 rounded-md border border-[var(--border-strong)] bg-surface-muted px-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-[#2ca7e1]/50 hover:bg-surface hover:text-[#2ca7e1] sm:text-[15px]"
                          >
                            <MypageSearchPlusIcon className="h-5 w-5 shrink-0 text-text-muted" />
                            <span className="sr-only">샘플</span>
                          </SampleScoreModalTrigger>
                          <button
                            type="button"
                            aria-label="인쇄"
                            disabled={!canPrint || openingPrintId === row.mypage_print_sid}
                            title={
                              canPrint
                                ? '인쇄 준비 창을 엽니다.'
                                : atLimit
                                  ? '인쇄·다운로드 허용 횟수를 모두 사용했습니다.'
                                  : '현재 인쇄·다운로드가 제한된 상태입니다.'
                            }
                            onClick={() => void handlePrintClick(row)}
                            className="inline-flex min-h-[2.75rem] min-w-[2.75rem] items-center justify-center gap-0 rounded-md border border-[var(--border-strong)] bg-[#2ca7e1] px-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2496cc] disabled:cursor-not-allowed disabled:opacity-45 sm:text-[15px]"
                          >
                            {openingPrintId === row.mypage_print_sid ? (
                              '…'
                            ) : (
                              <>
                                <MypagePrinterIcon className="h-5 w-5 shrink-0 text-white/95" />
                                <span className="sr-only">인쇄</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="hidden text-center text-sm leading-snug text-text-secondary sm:text-[15px] md:col-start-3 md:row-start-1 md:block">
                    {periodInner}
                  </div>

                  <div className="hidden md:contents">
                    <div className="flex justify-center md:col-start-4 md:row-start-1">
                      <SampleScoreModalTrigger
                        sampleImageUrl={sampleUrl}
                        title={titleText}
                        heading="샘플 보기"
                        ariaLabel="샘플 보기"
                        className="inline-flex min-h-[2.75rem] min-w-[5.25rem] items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-surface-muted px-3 text-sm font-medium text-text-secondary transition-colors hover:border-[#2ca7e1]/50 hover:bg-surface hover:text-[#2ca7e1] sm:text-[15px]"
                      >
                        <MypageSearchPlusIcon className="h-5 w-5 shrink-0 text-text-muted" />
                        <span>샘플</span>
                      </SampleScoreModalTrigger>
                    </div>
                    <div className="flex justify-center md:col-start-5 md:row-start-1">
                      <button
                        type="button"
                        aria-label="인쇄"
                        disabled={!canPrint || openingPrintId === row.mypage_print_sid}
                        title={
                          canPrint
                            ? '인쇄 준비 창을 엽니다.'
                            : atLimit
                              ? '인쇄·다운로드 허용 횟수를 모두 사용했습니다.'
                              : '현재 인쇄·다운로드가 제한된 상태입니다.'
                        }
                        onClick={() => void handlePrintClick(row)}
                        className="inline-flex min-h-[2.75rem] min-w-[5.25rem] items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-[#2ca7e1] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2496cc] disabled:cursor-not-allowed disabled:opacity-45 sm:text-[15px]"
                      >
                        {openingPrintId === row.mypage_print_sid ? (
                          '…'
                        ) : (
                          <>
                            <MypagePrinterIcon className="h-5 w-5 shrink-0 text-white/95" />
                            인쇄
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

      {printPortal}
    </div>
  );
}

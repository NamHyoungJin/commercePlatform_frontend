'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MypageTrashIcon, MypageXIcon } from '@/components/mypage/mypageActionIcons';
import { MODAL_CONTENT_BG, MODAL_TITLE_BAR, modalTitleHeadingClass } from '@/components/modals/modalTitleBar';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  /** 곡명 등 보조 한 줄 */
  detail?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

/**
 * 확인/취소 다이얼로그 — `alert`/`confirm` 대체용 (포털·ESC·스크롤 잠금)
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  detail,
  confirmLabel = '삭제',
  cancelLabel = '취소',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" aria-label={cancelLabel} onClick={onCancel} />
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-[#fff] shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-5 py-3 sm:px-6 sm:py-3.5 ${MODAL_TITLE_BAR}`}>
          <h2 id="confirm-dialog-title" className={`text-lg sm:text-xl ${modalTitleHeadingClass}`}>
            {title}
          </h2>
        </div>
        <div className={`p-5 sm:p-6 ${MODAL_CONTENT_BG}`}>
          <p id="confirm-dialog-desc" className="text-[15px] leading-relaxed text-neutral-700 sm:text-base">
            {message}
          </p>
          {detail ? (
            <p
              className="mt-2 truncate rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700"
              title={detail}
            >
              {detail}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-base font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-50"
          >
            <MypageXIcon className="h-5 w-5 shrink-0 text-neutral-500" />
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => void onConfirm()}
            className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-base font-semibold text-red-800 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <MypageTrashIcon className="h-5 w-5 shrink-0 text-red-600" />
            {pending ? '처리 중…' : confirmLabel}
          </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

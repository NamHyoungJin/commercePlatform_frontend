'use client';

import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { MODAL_CONTENT_BG, MODAL_TITLE_BAR, modalTitleHeadingClass } from '@/components/modals/modalTitleBar';

export type CartAddedModalProps = {
  open: boolean;
  onClose: () => void;
  /** API `detail` 또는 기본 문구 */
  message?: string;
};

/**
 * 장바구니 담기 성공 안내 — 닫기 / 장바구니로 이동
 */
export default function CartAddedModal({ open, onClose, message }: CartAddedModalProps) {
  const router = useRouter();
  const titleId = useId();
  const body = message?.trim() || '장바구니에 저장되었습니다.';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" aria-label="배경 닫기" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-xl border border-neutral-200 bg-[#fff] shadow-xl ring-1 ring-black/5">
        <div className={`flex items-center px-5 py-3 sm:px-6 sm:py-3.5 ${MODAL_TITLE_BAR}`}>
          <h2 id={titleId} className={`text-base ${modalTitleHeadingClass}`}>
            장바구니
          </h2>
        </div>
        <div className={`p-5 sm:p-6 ${MODAL_CONTENT_BG}`}>
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 ring-1 ring-teal-300/80"
              aria-hidden
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-neutral-600">{body}</p>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 sm:w-auto"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/mypage/cart2');
            }}
            className="w-full rounded-lg bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500 sm:w-auto"
          >
            장바구니로 가기
          </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

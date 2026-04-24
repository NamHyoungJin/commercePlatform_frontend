'use client';

import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { MODAL_CONTENT_BG, MODAL_TITLE_BAR, modalTitleHeadingClass } from '@/components/modals/modalTitleBar';

export type WishFeedbackVariant = 'added' | 'already_exists' | 'error';

export type WishFeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  variant: WishFeedbackVariant;
  /** variant가 error일 때 표시할 메시지 */
  errorMessage?: string;
};

const copy: Record<WishFeedbackVariant, { title: string; body: string }> = {
  added: {
    title: '보관함',
    body: '보관함에 저장되었습니다. 마이페이지에서 확인할 수 있습니다.',
  },
  already_exists: {
    title: '보관함',
    body: '이미 보관함에 있는 악보입니다.',
  },
  error: {
    title: '보관함',
    body: '보관함에 담지 못했습니다.',
  },
};

/**
 * 보관함 담기 결과 안내 — 장바구니 성공 모달과 동일 UX(포털·Esc·스크롤 잠금)
 */
export default function WishFeedbackModal({ open, onClose, variant, errorMessage }: WishFeedbackModalProps) {
  const router = useRouter();
  const titleId = useId();
  const preset = copy[variant];
  const body =
    variant === 'error' && errorMessage?.trim() ? errorMessage.trim() : preset.body;

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

  const showWishLink = variant === 'added';

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
            {preset.title}
          </h2>
        </div>
        <div className={`p-5 sm:p-6 ${MODAL_CONTENT_BG}`}>
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ${
                variant === 'error'
                  ? 'bg-red-100 text-red-700 ring-red-300/80'
                  : 'bg-rose-100 text-rose-700 ring-rose-300/80'
              }`}
              aria-hidden
            >
              {variant === 'error' ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
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
          {showWishLink ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push('/mypage/wish');
              }}
              className="w-full rounded-lg bg-rose-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500 sm:w-auto"
            >
              보관함으로 가기
            </button>
          ) : null}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

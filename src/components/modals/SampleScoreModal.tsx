'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  MODAL_CONTENT_BG,
  MODAL_TITLE_BAR,
  modalCloseButtonOnBarClass,
  modalTitleHeadingClass,
  modalTitleSubOnBarClass,
} from '@/components/modals/modalTitleBar';

export type SampleScoreModalProps = {
  open: boolean;
  onClose: () => void;
  /** 악보 샘플(썸네일/미리보기) 이미지 URL */
  imageUrl: string | null;
  /** 곡 제목(헤더 보조 표시) */
  title: string;
  /** 헤더 큰 제목 (기본: 샘플 보기) */
  heading?: string;
};

/**
 * 악보 샘플 이미지 전체 화면 모달 — 포털·ESC·배경 클릭·스크롤 잠금
 */
export function SampleScoreModal({
  open,
  onClose,
  imageUrl,
  title,
  heading = '샘플 보기',
}: SampleScoreModalProps) {
  const titleId = useId();

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
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
        aria-label="배경 닫기"
        onClick={onClose}
      />
      <div
        className={`relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-neutral-600/40 shadow-2xl ring-1 ring-black/5 ${MODAL_CONTENT_BG}`}
      >
        <header
          className={`flex shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 ${MODAL_TITLE_BAR}`}
        >
          <div className="min-w-0">
            <h2 id={titleId} className={`text-base sm:text-lg ${modalTitleHeadingClass}`}>
              {heading}
            </h2>
            <p className={`mt-0.5 truncate text-xs sm:text-sm ${modalTitleSubOnBarClass}`}>{title}</p>
          </div>
          <button type="button" onClick={onClose} className={modalCloseButtonOnBarClass} aria-label="닫기">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className={`min-h-0 flex-1 overflow-auto p-4 sm:p-6 ${MODAL_CONTENT_BG}`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="mx-auto block h-auto max-h-[calc(92vh-140px)] w-full max-w-full object-contain"
            />
          ) : (
            <p className="py-16 text-center text-sm text-neutral-500">등록된 샘플 이미지가 없습니다.</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export type SampleScoreModalTriggerProps = {
  sampleImageUrl: string | null;
  title: string;
  className?: string;
  children?: ReactNode;
  heading?: string;
  /** 자식에 보이는 텍스트가 없을 때(아이콘만) 접근 가능한 이름 */
  ariaLabel?: string;
};

/** `샘플 보기` 버튼 + 모달 상태를 한 컴포넌트로 묶음 */
export function SampleScoreModalTrigger({
  sampleImageUrl,
  title,
  className,
  children = '샘플 보기',
  heading,
  ariaLabel,
}: SampleScoreModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="contents">
      <button
        type="button"
        className={className ?? ''}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <SampleScoreModal
        open={open}
        onClose={() => setOpen(false)}
        imageUrl={sampleImageUrl}
        title={title}
        heading={heading}
      />
    </div>
  );
}

export default SampleScoreModal;

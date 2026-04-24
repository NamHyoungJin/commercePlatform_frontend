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
import { scoresApi, type ScoreLyricsResponse } from '@/lib/scoresApi';

/** DB/레거시에 남은 `<br>` 등을 줄바꿈으로만 정리 (HTML 렌더링은 하지 않음) */
export function lyricsToPlainText(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function buildCreditLine(d: {
  music_kor_name: string;
  music_score_title: string;
  music_write: string;
  music_compose: string;
}): string {
  const name = (d.music_kor_name || d.music_score_title || '').trim() || '—';
  const w = (d.music_write || '').trim() || '—';
  const c = (d.music_compose || '').trim() || '—';
  return `${name} (작사:${w}, 작곡:${c})`;
}

export type ScoreLyricPreview = {
  title: string;
  korName: string;
  musicWrite: string;
  musicCompose: string;
};

export type ScoreLyricModalProps = {
  open: boolean;
  onClose: () => void;
  scoreSid: string;
  /** 목록 행 메타 — 로딩 중 헤더 부제에 사용 */
  preview?: ScoreLyricPreview | null;
  heading?: string;
};

export function ScoreLyricModal({
  open,
  onClose,
  scoreSid,
  preview,
  heading = '가사 보기',
}: ScoreLyricModalProps) {
  const titleId = useId();
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [data, setData] = useState<ScoreLyricsResponse | null>(null);

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

  useEffect(() => {
    if (!open || !scoreSid) return;
    let cancelled = false;
    setStatus('loading');
    setData(null);
    scoresApi
      .lyrics(scoreSid)
      .then((r) => {
        if (!cancelled) {
          setData(r.data);
          setStatus('ok');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [open, scoreSid]);

  if (!open || typeof document === 'undefined') return null;

  const previewLine = preview
    ? buildCreditLine({
        music_kor_name: preview.korName,
        music_score_title: preview.title,
        music_write: preview.musicWrite,
        music_compose: preview.musicCompose,
      })
    : null;

  const loadedLine =
    data &&
    buildCreditLine({
      music_kor_name: data.music_kor_name,
      music_score_title: data.music_score_title,
      music_write: data.music_write,
      music_compose: data.music_compose,
    });

  const subtitle = status === 'ok' && loadedLine ? loadedLine : previewLine || '가사를 불러오는 중…';

  const plainLyrics = data ? lyricsToPlainText(data.lyrics) : '';

  return createPortal(
    <div
      className="fixed inset-0 z-[205] flex items-center justify-center p-3 sm:p-6"
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
        className={`relative z-10 flex max-h-[min(92vh,880px)] w-full max-w-lg flex-col overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/10 sm:max-w-xl ${MODAL_CONTENT_BG}`}
      >
        <header
          className={`flex shrink-0 items-start justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 ${MODAL_TITLE_BAR}`}
        >
          <div className="min-w-0 pr-2">
            <h2 id={titleId} className={`text-base sm:text-lg ${modalTitleHeadingClass}`}>
              {heading}
            </h2>
            <p className={`mt-1 text-left text-xs leading-snug sm:text-sm ${modalTitleSubOnBarClass}`}>{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className={modalCloseButtonOnBarClass} aria-label="닫기">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div className={`min-h-0 flex-1 overflow-auto px-4 py-5 sm:px-6 sm:py-6 ${MODAL_CONTENT_BG}`}>
          {status === 'loading' && (
            <div className="space-y-3 animate-pulse" aria-busy>
              <div className="h-4 w-full rounded bg-neutral-200" />
              <div className="h-4 w-[92%] rounded bg-neutral-200" />
              <div className="h-4 w-full rounded bg-neutral-200" />
              <div className="h-4 w-[80%] rounded bg-neutral-200" />
            </div>
          )}
          {status === 'error' && (
            <p className="py-10 text-center text-sm text-red-600">가사를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
          )}
          {status === 'ok' && !plainLyrics && (
            <p className="py-10 text-center text-sm text-neutral-500">등록된 가사가 없습니다.</p>
          )}
          {status === 'ok' && plainLyrics && (
            <div className="text-left text-sm leading-relaxed text-neutral-900 sm:text-[15px]">
              <pre className="font-sans whitespace-pre-wrap break-words">{plainLyrics}</pre>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export type ScoreLyricModalTriggerProps = {
  scoreSid: string;
  preview: ScoreLyricPreview;
  className?: string;
  children?: ReactNode;
  /** 자식에 보이는 텍스트가 없을 때(아이콘만) 접근 가능한 이름 */
  ariaLabel?: string;
};

export function ScoreLyricModalTrigger({
  scoreSid,
  preview,
  className,
  children = '가사 보기',
  ariaLabel,
}: ScoreLyricModalTriggerProps) {
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
      <ScoreLyricModal open={open} onClose={() => setOpen(false)} scoreSid={scoreSid} preview={preview} />
    </div>
  );
}

export default ScoreLyricModal;

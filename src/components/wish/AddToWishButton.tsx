'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';
import { useAuthStore } from '@/store/authStore';
import { wishApi } from '@/lib/wishApi';
import WishFeedbackModal, { type WishFeedbackVariant } from '@/components/wish/WishFeedbackModal';

type AnchorRect = { top: number; left: number; width: number; height: number };

const detailClass =
  'inline-flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-md border border-[var(--border-strong)] bg-surface px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm transition-colors hover:border-accent-teal/40 hover:bg-surface-muted disabled:opacity-60';

type Props = {
  scoreSid: string;
  className?: string;
  label?: string;
};

export default function AddToWishButton({ scoreSid, className = '', label = '보관함 담기' }: Props) {
  const pathname = usePathname();
  const authReady = useAuthStore((s) => s.authReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const balloonRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [loginHintAnchor, setLoginHintAnchor] = useState<AnchorRect | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackVariant, setFeedbackVariant] = useState<WishFeedbackVariant>('added');
  const [feedbackError, setFeedbackError] = useState<string | undefined>();

  const measureAnchor = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setLoginHintAnchor({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, []);

  useEffect(() => {
    if (!loginHintAnchor) return;

    const onScrollOrResize = () => measureAnchor();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    const t = window.setTimeout(() => setLoginHintAnchor(null), 5200);

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const node = e.target;
      if (!(node instanceof Node)) return;
      if (buttonRef.current?.contains(node)) return;
      if (balloonRef.current?.contains(node)) return;
      setLoginHintAnchor(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      window.clearTimeout(t);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [loginHintAnchor, measureAnchor]);

  const handleClick = useCallback(async () => {
    if (!authReady) return;
    if (!isAuthenticated) {
      const el = buttonRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setLoginHintAnchor({ top: r.top, left: r.left, width: r.width, height: r.height });
      return;
    }
    setPending(true);
    try {
      const { data } = await wishApi.add(scoreSid);
      if (data.added) {
        setFeedbackError(undefined);
        setFeedbackVariant('added');
        setFeedbackOpen(true);
      } else if ('already_exists' in data && data.already_exists) {
        setFeedbackError(undefined);
        setFeedbackVariant('already_exists');
        setFeedbackOpen(true);
      }
    } catch (e) {
      const msg = axios.isAxiosError(e) ? formatApiErrorMessage(e.response?.data) : '보관함에 담지 못했습니다.';
      setFeedbackVariant('error');
      setFeedbackError(msg);
      setFeedbackOpen(true);
    } finally {
      setPending(false);
    }
  }, [authReady, isAuthenticated, scoreSid]);

  const halfBubble = 132;
  const loginHintBalloon =
    loginHintAnchor && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={balloonRef}
            className="pointer-events-auto fixed z-[250] w-[min(264px,calc(100vw-16px))]"
            style={{
              left: Math.max(
                halfBubble + 8,
                Math.min(
                  loginHintAnchor.left + loginHintAnchor.width / 2,
                  window.innerWidth - halfBubble - 8,
                ),
              ),
              top: loginHintAnchor.top,
              transform: 'translate(-50%, calc(-100% - 14px))',
            }}
            role="tooltip"
          >
            <div className="relative rounded-2xl border border-rose-200/80 bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6]/95 px-4 py-3 text-center shadow-lg shadow-rose-900/[0.08] ring-1 ring-rose-100/60">
              <p className="text-sm font-medium leading-snug text-[#9f1239]/90">로그인 후 이용해주세요</p>
              <Link
                href={`/login?next=${encodeURIComponent(pathname || '/')}`}
                className="mt-2 inline-block text-xs font-medium text-[#be123c]/85 underline decoration-rose-300 decoration-1 underline-offset-2 hover:text-[#9f1239]"
                onClick={() => setLoginHintAnchor(null)}
              >
                로그인하기
              </Link>
              <div
                className="pointer-events-none absolute left-1/2 top-full mt-[-5px] h-3 w-3 -translate-x-1/2 rotate-45 border border-rose-200/80 border-t-0 border-l-0 bg-[#ffe4e6]/95"
                aria-hidden
              />
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={pending || !authReady}
        onClick={() => void handleClick()}
        className={`${detailClass} ${className}`.trim()}
      >
        <svg
          aria-hidden
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
        {label}
      </button>
      {loginHintBalloon}
      <WishFeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        variant={feedbackVariant}
        errorMessage={feedbackError}
      />
    </>
  );
}

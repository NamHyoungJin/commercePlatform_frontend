'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import CartAddedModal from '@/components/cart/CartAddedModal';
import { cartApi } from '@/lib/cartApi';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';
import { useAuthStore } from '@/store/authStore';

type AnchorRect = { top: number; left: number; width: number; height: number };

export type AddToCartVariant = 'detail' | 'catalogRow' | 'neutralOutline';

const variantClass: Record<AddToCartVariant, string> = {
  detail:
    'inline-flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-md bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-500 disabled:opacity-60',
  catalogRow:
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--border-strong)] bg-accent-teal font-medium text-white shadow-sm transition-colors hover:bg-accent-teal-hover disabled:opacity-60',
  neutralOutline:
    'inline-flex w-full min-w-0 max-w-full min-h-[2.75rem] items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[var(--border-strong)] bg-surface px-4 py-2.5 text-center text-sm font-medium leading-tight text-text-primary transition-colors hover:border-accent-teal/40 hover:bg-surface-muted disabled:opacity-50 sm:text-[15px]',
};

function cartIconClass(variant: AddToCartVariant, sizeLarge: boolean): string {
  if (variant === 'detail') return 'h-5 w-5 shrink-0 text-white';
  if (variant === 'neutralOutline') return 'h-5 w-5 shrink-0 text-current opacity-90';
  return sizeLarge ? 'h-5 w-5 shrink-0 text-white' : 'h-4 w-4 shrink-0 text-white';
}

type Props = {
  scoreSid: string;
  variant: AddToCartVariant;
  /** catalogRow에서 large 행과 맞춤 */
  sizeLarge?: boolean;
  className?: string;
  label?: string;
  /** 라벨을 감쌀 때(예: `max-md:sr-only`로 모바일에서 아이콘만 보이게) */
  labelClassName?: string;
  onAdded?: () => void;
};

export default function AddToCartButton({
  scoreSid,
  variant,
  sizeLarge = false,
  className = '',
  label = '장바구니',
  labelClassName,
  onAdded,
}: Props) {
  const pathname = usePathname();
  const authReady = useAuthStore((s) => s.authReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const balloonRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [loginHintAnchor, setLoginHintAnchor] = useState<AnchorRect | null>(null);

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
    setSuccessOpen(false);
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
      const { data } = await cartApi.add(scoreSid, 1);
      onAdded?.();
      setSuccessMessage(data.detail || undefined);
      setSuccessOpen(true);
    } catch (e) {
      const msg = axios.isAxiosError(e) ? formatApiErrorMessage(e.response?.data) : '장바구니에 담지 못했습니다.';
      window.alert(msg);
    } finally {
      setPending(false);
    }
  }, [authReady, isAuthenticated, onAdded, scoreSid]);

  const rowLarge = variant === 'catalogRow' && sizeLarge;

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
      <span className="inline-flex flex-col items-stretch gap-1">
        <button
          ref={buttonRef}
          type="button"
          disabled={pending || !authReady}
          onClick={() => void handleClick()}
          aria-label={!label?.trim() ? '장바구니' : undefined}
          className={`${variantClass[variant]} ${
            variant === 'catalogRow' ? (rowLarge ? 'size-10' : 'size-8') : ''
          } ${className}`.trim()}
        >
          <svg
            aria-hidden
            className={cartIconClass(variant, rowLarge)}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {label?.trim() ? (
            labelClassName ? (
              <span className={labelClassName}>{label}</span>
            ) : (
              label
            )
          ) : null}
        </button>
      </span>
      <CartAddedModal open={successOpen} onClose={() => setSuccessOpen(false)} message={successMessage} />
      {loginHintBalloon}
    </>
  );
}

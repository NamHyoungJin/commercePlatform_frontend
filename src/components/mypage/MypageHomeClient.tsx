'use client';

import { useEffect, useState } from 'react';
import Link from '@/components/AppLink';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { cartApi } from '@/lib/cartApi';
import { wishApi } from '@/lib/wishApi';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconHeart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconCart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function IconPrint({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function IconShieldCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

const tileCls =
  'group relative flex flex-col gap-3 rounded-2xl border border-[var(--border-strong)] bg-surface-muted p-5 shadow-sm transition-all duration-200 hover:border-[#2ca7e1]/40 hover:bg-surface hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4';

const statCls =
  'rounded-xl border border-[var(--border-strong)] bg-surface-muted px-4 py-4 sm:px-5 sm:py-5';

function formatWon(n: number) {
  return new Intl.NumberFormat('ko-KR').format(Math.max(0, Math.floor(n))) + '원';
}

export default function MypageHomeClient() {
  const member = useAuthStore((s) => s.member);
  const [wishCount, setWishCount] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState<number | null>(null);
  const [cartTotal, setCartTotal] = useState<number | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryErr, setSummaryErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSummaryLoading(true);
      setSummaryErr(null);
      try {
        const [wishRes, cartRes] = await Promise.all([wishApi.list(1), cartApi.list()]);
        if (cancelled) return;
        setWishCount(wishRes.data.count ?? 0);
        setCartCount(cartRes.data.count ?? cartRes.data.results?.length ?? 0);
        setCartTotal(typeof cartRes.data.total_price === 'number' ? cartRes.data.total_price : 0);
      } catch (e) {
        if (!cancelled) {
          setSummaryErr(axios.isAxiosError(e) ? formatApiErrorMessage(e.response?.data) : '요약 정보를 불러오지 못했습니다.');
          setWishCount(null);
          setCartCount(null);
          setCartTotal(null);
        }
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const name = (member?.name || '회원').trim();
  const nick = (member?.nickname || '').trim();
  const mid = (member?.member_id || '').trim();
  const emailOk = Boolean(member?.id_verified_email);
  const phoneOk = Boolean(member?.id_verified_phone);
  const bothVerified = emailOk && phoneOk;
  const partialVerified = !bothVerified && (emailOk || phoneOk);

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-gradient-to-br from-surface-muted to-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#2ca7e1]/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2ca7e1]">My studio</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">안녕하세요, {name}님</h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-text-secondary">
              찬양 악보를 모으고, 장바구니에서 구매까지 이어 가세요. 인쇄·다운로드는 구매한 악보를 바로 사용할 때
              이용합니다.
            </p>
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-muted">
              {mid ? (
                <div>
                  <dt className="inline">아이디</dt>{' '}
                  <dd className="inline font-medium text-text-primary">{mid}</dd>
                </div>
              ) : null}
              {nick ? (
                <div>
                  <dt className="inline">닉네임</dt>{' '}
                  <dd className="inline font-medium text-text-primary">{nick}</dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            {bothVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
                <IconShieldCheck className="size-3.5 text-emerald-600" />
                본인 인증 완료
              </span>
            ) : partialVerified ? (
              <span className="inline-flex max-w-xs flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs leading-relaxed text-amber-950 sm:max-w-sm sm:text-right">
                <span>
                  {emailOk && !phoneOk
                    ? '휴대폰 본인 인증을 추가하면 비밀번호 찾기 등에 모두 사용할 수 있습니다.'
                    : !emailOk && phoneOk
                      ? '이메일 본인 인증을 추가하면 비밀번호 찾기 등에 모두 사용할 수 있습니다.'
                      : null}
                </span>
                <Link
                  href="/membership/member/modify"
                  className="font-semibold text-[#2ca7e1] underline decoration-[#2ca7e1]/40 underline-offset-2 hover:text-[#2496cc]"
                >
                  회원정보에서 인증하기
                </Link>
              </span>
            ) : (
              <span className="inline-flex max-w-xs flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs leading-relaxed text-amber-950 sm:max-w-sm sm:text-right">
                <span>이메일·휴대폰 본인 인증을 마치면 비밀번호 찾기 등이 더 안전해집니다.</span>
                <Link
                  href="/membership/member/modify"
                  className="font-semibold text-[#2ca7e1] underline decoration-[#2ca7e1]/40 underline-offset-2 hover:text-[#2496cc]"
                >
                  회원정보에서 인증하기
                </Link>
              </span>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="mypage-summary-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h3 id="mypage-summary-heading" className="text-lg font-semibold text-text-primary">
            빠른 요약
          </h3>
          {summaryErr ? (
            <p className="text-xs text-amber-800" role="status">
              {summaryErr}
            </p>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div className={statCls}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">보관함</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary sm:text-3xl">
              {summaryLoading ? '…' : wishCount !== null ? wishCount : '—'}
            </p>
            <p className="mt-1 text-xs text-text-muted">관심 악보</p>
          </div>
          <div className={statCls}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">장바구니</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary sm:text-3xl">
              {summaryLoading ? '…' : cartCount !== null ? cartCount : '—'}
            </p>
            <p className="mt-1 text-xs text-text-muted">담긴 품목 수</p>
          </div>
          <div className={`${statCls} border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/80`}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-900/80">장바구니 합계</p>
            <p className="mt-2 text-xl font-bold tabular-nums text-amber-950 sm:text-2xl">
              {summaryLoading ? '…' : cartTotal !== null ? formatWon(cartTotal) : '—'}
            </p>
            <p className="mt-1 text-xs text-amber-900/70">결제 전 참고 금액</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="mypage-actions-heading">
        <h3 id="mypage-actions-heading" className="mb-4 text-lg font-semibold text-text-primary">
          자주 쓰는 메뉴
        </h3>
        <ul className="flex flex-col gap-3 sm:gap-4">
          <li>
            <Link href="/membership/member/modify" className={tileCls}>
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-200">
                  <IconUser className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary">회원정보 수정</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">연락처, 수신 동의, 본인 인증, 비밀번호 변경</p>
                </div>
              </div>
              <IconChevron className="size-5 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-[#2ca7e1]" />
            </Link>
          </li>
          <li>
            <Link href="/mypage/wish" className={tileCls}>
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                  <IconHeart className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary">보관함</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">마음에 드는 악보를 모아 두었다가 장바구니로</p>
                </div>
              </div>
              <IconChevron className="size-5 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-[#2ca7e1]" />
            </Link>
          </li>
          <li>
            <Link href="/mypage/cart2" className={tileCls}>
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                  <IconCart className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary">장바구니</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">구매할 악보를 정리하고 주문을 진행하세요</p>
                </div>
              </div>
              <IconChevron className="size-5 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-[#2ca7e1]" />
            </Link>
          </li>
          <li>
            <Link href="/mypage/printdown" className={tileCls}>
              <div className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-surface text-text-secondary ring-0">
                  <IconPrint className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-text-primary">인쇄 / 다운로드</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">구매한 악보 파일과 인쇄용 자료</p>
                </div>
              </div>
              <IconChevron className="size-5 shrink-0 text-text-muted transition group-hover:translate-x-0.5 group-hover:text-[#2ca7e1]" />
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--border-strong)] bg-surface-muted px-5 py-6 sm:px-8 sm:py-7">
        <h3 className="text-base font-semibold text-text-primary">악보 더 찾기</h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          새로 올라온 찬양 악보와 인기 차트를 둘러보세요.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/scores?sort=newest"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border-strong)] bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:border-[#2ca7e1]/50 hover:bg-surface-muted"
          >
            최신 악보
          </Link>
          <Link
            href="/scores?sort=popular"
            className="inline-flex items-center justify-center rounded-full bg-[#2ca7e1] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2ca7e1]/25 transition hover:bg-[#2496cc]"
          >
            인기 악보
          </Link>
          <Link
            href="/scores"
            className="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-2.5 text-sm font-medium text-[#2ca7e1] underline-offset-4 hover:text-[#2496cc] hover:underline"
          >
            전체 악보
          </Link>
        </div>
      </section>
    </div>
  );
}

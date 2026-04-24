'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

/** `useSearchParams` — 부모에서 `<Suspense>`로 감쌀 것 */
export default function MypageCartCheckoutBanner() {
  const searchParams = useSearchParams();
  const checkout = searchParams.get('checkout');
  const reason = searchParams.get('reason');
  const orderId = searchParams.get('orderId');

  const failText = useMemo(() => {
    if (!reason) return null;
    try {
      return decodeURIComponent(reason);
    } catch {
      return reason;
    }
  }, [reason]);

  if (checkout === 'ok') {
    return (
      <p
        className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[15px] leading-relaxed text-emerald-950 sm:text-base"
        role="status"
      >
        결제가 완료되었습니다.
        {orderId ? (
          <span className="mt-1 block text-sm text-emerald-800 tabular-nums">주문번호 {orderId}</span>
        ) : null}
        <span className="mt-2 block text-sm text-emerald-800/90">
          악보 인쇄·PDF는 마이페이지의 인쇄하기 메뉴에서 이용할 수 있습니다.
        </span>
      </p>
    );
  }

  if (checkout === 'fail' && failText) {
    return (
      <p
        className="rounded-lg border border-red-200 bg-red-50 p-3 text-[15px] leading-relaxed text-red-900 sm:text-base"
        role="alert"
      >
        {failText}
      </p>
    );
  }

  return null;
}

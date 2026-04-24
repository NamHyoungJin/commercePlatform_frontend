'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import RequireAuth from '@/components/auth/RequireAuth';
import { checkoutApi } from '@/lib/checkoutApi';
import { formatCheckoutFailureMessage } from '@/lib/checkoutErrors';

export default function MypageCheckoutPage() {
  const router = useRouter();
  const started = useRef(false);
  const [message, setMessage] = useState('결제창으로 이동 중입니다…');

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      try {
        const { data } = await checkoutApi.prepare();
        const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
        const tossPayments = await loadTossPayments(data.client_key);
        const payment = tossPayments.payment({ customerKey: data.customer_key });
        await payment.requestPayment({
          method: 'CARD',
          amount: { currency: 'KRW', value: data.amount },
          orderId: data.order_id,
          orderName: data.order_name,
          successUrl: data.success_url,
          failUrl: data.fail_url,
          customerEmail: data.customer_email || undefined,
          customerName: data.customer_name || undefined,
          ...(data.customer_mobile_phone
            ? { customerMobilePhone: data.customer_mobile_phone }
            : {}),
        });
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[checkout/card]', e);
        }
        const msg = formatCheckoutFailureMessage(e);
        setMessage(msg);
        router.replace(`/mypage/cart2?checkout=fail&reason=${encodeURIComponent(msg.slice(0, 500))}`);
      }
    };

    void run();
  }, [router]);

  return (
    <RequireAuth>
      <div className="flex min-h-[min(560px,calc(100dvh-10rem))] flex-1 flex-col items-center justify-center px-4 py-16 text-center text-base text-text-muted">
        {message}
      </div>
    </RequireAuth>
  );
}

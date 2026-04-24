'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import RequireAuth from '@/components/auth/RequireAuth';
import { checkoutApi, type CheckoutPrepareResult } from '@/lib/checkoutApi';
import { formatCheckoutFailureMessage } from '@/lib/checkoutErrors';

type TossWidgetInstance = {
  setAmount: (a: { currency: string; value: number }) => Promise<unknown>;
  renderPaymentMethods: (o: { selector: string; variantKey: string }) => Promise<unknown>;
  renderAgreement: (o: { selector: string; variantKey: string }) => Promise<unknown>;
  requestPayment: (o: Record<string, unknown>) => Promise<unknown>;
};

/** PayPal STC 등에 넣을 ASCII 상품명 */
function paypalAsciiName(s: string): string {
  const ascii = Array.from(s)
    .map((ch) => (ch.charCodeAt(0) <= 127 ? ch : ' '))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
  return ascii.slice(0, 127) || 'Music score';
}

export default function MypageCheckoutPaypalPage() {
  const router = useRouter();
  const started = useRef(false);
  const prepRef = useRef<CheckoutPrepareResult | null>(null);
  const widgetsRef = useRef<TossWidgetInstance | null>(null);
  const [message, setMessage] = useState('PayPal 결제 준비 중…');
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const failRedirect = useCallback(
    (msg: string) => {
      const q = encodeURIComponent(msg.slice(0, 500));
      router.replace(`/mypage/cart2?checkout=fail&reason=${q}`);
    },
    [router],
  );

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      try {
        const { data } = await checkoutApi.prepare({ payMethod: 'paypal' });
        if (data.pay_kind !== 'paypal' || data.amount_usd == null) {
          throw new Error('서버가 PayPal 주문으로 준비되지 않았습니다.');
        }
        prepRef.current = data;

        const { loadTossPayments } = await import('@tosspayments/tosspayments-sdk');
        const tossPayments = await loadTossPayments(data.client_key);
        const tp = tossPayments as unknown as {
          widgets?: (opts: { customerKey: string }) => TossWidgetInstance;
        };
        if (typeof tp.widgets !== 'function') {
          throw new Error('결제위젯(widgets)을 사용할 수 없습니다. @tosspayments/tosspayments-sdk 버전을 확인하세요.');
        }
        const widgets = tp.widgets({ customerKey: data.customer_key });

        await widgets.setAmount({
          currency: 'USD',
          value: Number(data.amount_usd),
        });

        const paymentVariantKey = data.paypal_variant_key || 'PAYPAL';
        const agreementVariantKey = data.paypal_agreement_variant_key || 'AGREEMENT';

        await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#paypal-payment-methods',
            variantKey: paymentVariantKey,
          }),
          widgets.renderAgreement({
            selector: '#paypal-agreement',
            variantKey: agreementVariantKey,
          }),
        ]);

        widgetsRef.current = widgets;
        setReady(true);
        setMessage('결제 수단과 약관을 확인한 뒤 아래 버튼으로 진행해 주세요.');
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[checkout/paypal init]', e);
        }
        const msg = formatCheckoutFailureMessage(e);
        setError(msg);
        failRedirect(msg);
      }
    };

    void run();
  }, [failRedirect]);

  const onPay = async () => {
    const prep = prepRef.current;
    const widgets = widgetsRef.current;
    if (!prep || !widgets) return;
    try {
      const orderName = paypalAsciiName(prep.order_name);
      const unit = Number(prep.amount_usd);
      await widgets.requestPayment({
        orderId: prep.order_id,
        orderName,
        successUrl: prep.success_url,
        failUrl: prep.fail_url,
        customerEmail: prep.customer_email || undefined,
        customerName: prep.customer_name || undefined,
        ...(prep.customer_mobile_phone ? { customerMobilePhone: prep.customer_mobile_phone } : {}),
        foreignEasyPay: {
          // 토스 PayPal 샘플과 동일(https://docs.tosspayments.com/guides/v2/payment-widget/integration-paypal). KR만 쓰면 PayPal 단계에서 거절될 수 있음.
          country: 'US',
          products: [
            {
              name: orderName,
              quantity: 1,
              unitAmount: unit,
              currency: 'USD',
              description: 'Digital music score',
            },
          ],
        },
      });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[checkout/paypal requestPayment]', e);
      }
      const msg = formatCheckoutFailureMessage(e);
      setError(msg);
      failRedirect(msg);
    }
  };

  return (
    <RequireAuth>
      <div className="mx-auto flex min-h-[min(560px,calc(100dvh-10rem))] max-w-lg flex-1 flex-col gap-6 px-4 py-10">
        <div>
          <h1 className="text-xl font-bold text-text-primary">PayPal 결제</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
            금액은 원화 합계를 기준으로 USD로 환산되어 표시됩니다.{' '}
            <a
              className="text-[#2ca7e1] underline hover:text-[#2496cc]"
              href="https://docs.tosspayments.com/guides/v2/payment-widget/integration-paypal"
              target="_blank"
              rel="noreferrer"
            >
              토스페이먼츠 PayPal 연동 가이드
            </a>
          </p>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-[15px] text-red-900" role="alert">
            {error}
          </p>
        ) : null}

        <div id="paypal-payment-methods" className="min-h-[4rem] w-full rounded-lg border border-[var(--border-strong)] bg-surface p-3" />
        <div id="paypal-agreement" className="min-h-[3rem] w-full rounded-lg border border-[var(--border-subtle)] bg-surface-muted/40 p-3" />

        <p className="text-center text-[15px] text-text-muted">{message}</p>

        <button
          type="button"
          disabled={!ready}
          onClick={() => void onPay()}
          className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-lg bg-[#2ca7e1] px-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#2496cc] disabled:cursor-not-allowed disabled:opacity-50"
        >
          PayPal로 결제하기
        </button>
      </div>
    </RequireAuth>
  );
}

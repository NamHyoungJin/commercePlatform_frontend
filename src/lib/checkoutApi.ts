import { apiClient } from './axios';

export type CheckoutPayKind = 'card' | 'paypal';

export type CheckoutPrepareResult = {
  pay_kind: CheckoutPayKind;
  order_id: string;
  amount: number;
  /** PayPal(USD) 결제 시에만 */
  amount_usd?: number;
  /** PayPal 결제위젯 `renderPaymentMethods` variantKey(어드민 UI 키, 기본 PAYPAL) */
  paypal_variant_key?: string;
  /** PayPal `renderAgreement` variantKey(어드민 약관 UI 키, 기본 AGREEMENT) */
  paypal_agreement_variant_key?: string;
  order_name: string;
  client_key: string;
  customer_key: string;
  customer_name: string;
  customer_email: string;
  customer_mobile_phone: string | null;
  success_url: string;
  fail_url: string;
};

export const checkoutApi = {
  prepare: (opts?: { payMethod?: CheckoutPayKind }) =>
    apiClient.post<CheckoutPrepareResult>('/mypage/checkout/prepare/', {
      pay_method: opts?.payMethod === 'paypal' ? 'paypal' : 'card',
    }),
};

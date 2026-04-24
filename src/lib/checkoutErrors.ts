import axios from 'axios';
import { formatApiErrorMessage } from '@/lib/onlyonemusicApi';

const TOSS_GENERIC_KO = '알 수 없는 에러가 발생했습니다.';

/** 결제 준비·위젯 초기화 catch 블록용 — Axios / 토스 SDK / 기타 구분 */
export function formatCheckoutFailureMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return error.message?.trim() || '서버에 연결하지 못했습니다. 네트워크와 API 주소를 확인해 주세요.';
    }
    const status = error.response.status;
    const fromBody = formatApiErrorMessage(error.response.data);
    return status ? `${fromBody} (HTTP ${status})` : fromBody;
  }
  if (error instanceof Error) {
    const m = (error.message || '').trim();
    if (!m) return '결제 준비 중 오류가 발생했습니다.';
    if (m === TOSS_GENERIC_KO || m.includes('알 수 없는 에러')) {
      return `${m} — 토스 결제위젯: 개발자센터에서 **결제위젯 연동** 클라이언트 키를 쓰는지, 어드민에 PayPal·이용약관 UI(variantKey)가 있는지, 브라우저 콘솔·Network 탭의 실패 요청을 확인해 주세요.`;
    }
    return m;
  }
  if (typeof error === 'string' && error.trim()) return error.trim();
  return '결제 준비 중 오류가 발생했습니다.';
}

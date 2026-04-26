import axios from 'axios';
import { tokenUtils } from '@/lib/tokenUtils';
import { unwrapOnlyonemusicBody } from '@/lib/onlyonemusicApi';

/**
 * `/auth/token/refresh/` 동시 호출 방지.
 * 백엔드가 refresh 회전(기존 폐기)하므로, AuthBootstrap·axios 401 인터셉터가 동시에 POST 하면 하나는 401로 떨어질 수 있음.
 */
let inFlight: Promise<string> | null = null;

export function refreshAccessTokenSingleton(): Promise<string> {
  if (inFlight) return inFlight;

  const run = async (): Promise<string> => {
    const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    if (!base) throw new Error('NEXT_PUBLIC_API_URL is not set');
    const { data } = await axios.post(
      `${base}/auth/token/refresh/`,
      {},
      { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
    );
    const unwrapped = unwrapOnlyonemusicBody<{ access?: string }>(data);
    const access = unwrapped.access;
    if (!access) throw new Error('no access token in refresh response');
    tokenUtils.setAccess(access);
    return access;
  };

  inFlight = run().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

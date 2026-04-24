import Cookies from 'js-cookie';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

// authRules.md / 백엔드 JWT: 액세스 15분 — 쿠키 만료를 JWT에 맞춤 (일 단위)
const ACCESS_EXPIRES_DAYS = 15 / (24 * 60);

export const tokenUtils = {
  getAccess: () => Cookies.get(ACCESS_TOKEN_KEY) ?? null,
  getRefresh: () => Cookies.get(REFRESH_TOKEN_KEY) ?? null,

  /** refresh는 HttpOnly 서버 쿠키 — 클라이언트에는 access만 저장 */
  setTokens: (access: string, _refresh?: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, access, { expires: ACCESS_EXPIRES_DAYS });
  },

  setAccess: (access: string) => {
    Cookies.set(ACCESS_TOKEN_KEY, access, { expires: ACCESS_EXPIRES_DAYS });
  },

  clearTokens: () => {
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
  },
};

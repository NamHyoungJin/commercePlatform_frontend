import axios from 'axios';
import { tokenUtils } from './tokenUtils';
import { unwrapOnlyonemusicBody } from './onlyonemusicApi';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenUtils.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    try {
      response.data = unwrapOnlyonemusicBody(response.data);
    } catch (e) {
      return Promise.reject(e);
    }
    return response;
  },
  async (error) => {
    let d = error.response?.data;
    if (typeof d === 'string') {
      try {
        d = JSON.parse(d) as unknown;
        if (error.response) error.response.data = d;
      } catch {
        /* 문자열 그대로 */
      }
    }
    if (d && typeof d === 'object') {
      try {
        if (error.response) error.response.data = unwrapOnlyonemusicBody(d);
      } catch {
        /* 유지 */
      }
    }

    const originalRequest = error.config;
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const base = (apiClient.defaults.baseURL || process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const { data } = await axios.post(
        `${base}/auth/token/refresh/`,
        {},
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } },
      );
      const unwrapped = unwrapOnlyonemusicBody<{ access?: string }>(data);
      const access = unwrapped.access;
      if (!access) {
        throw new Error('no access token');
      }
      tokenUtils.setAccess(access);

      originalRequest.headers.Authorization = `Bearer ${access}`;
      processQueue(null, access);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenUtils.clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

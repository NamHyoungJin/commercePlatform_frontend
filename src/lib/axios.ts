import axios from 'axios';
import { tokenUtils } from './tokenUtils';
import { unwrapOnlyonemusicBody } from './onlyonemusicApi';
import { refreshAccessTokenSingleton } from './refreshAccessTokenSingleton';

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

    const reqUrl = `${originalRequest.baseURL || ''}${originalRequest.url || ''}`;
    if (reqUrl.includes('/auth/token/refresh/')) {
      tokenUtils.clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const access = await refreshAccessTokenSingleton();
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenUtils.clearTokens();
      return Promise.reject(refreshError);
    }
  },
);

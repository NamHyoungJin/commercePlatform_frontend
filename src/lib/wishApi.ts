import { apiClient } from './axios';
import type { Score } from './scoresApi';

export interface WishListResponse {
  count: number;
  page: number;
  page_size: number;
  results: (Score & { wish_reg_datetime?: string | null })[];
}

export type WishAddResponse =
  | { added: true; score_sid: string }
  | { added: false; already_exists: true; score_sid: string };

export const wishApi = {
  list: (page = 1) => apiClient.get<WishListResponse>('/mypage/wish/', { params: { page } }),
  add: (scoreSid: string) =>
    apiClient.post<WishAddResponse>('/mypage/wish/', { score_sid: scoreSid }),
  remove: (scoreSid: string) => apiClient.delete<{ deleted: boolean; score_sid: string }>(`/mypage/wish/${scoreSid}/`),
};

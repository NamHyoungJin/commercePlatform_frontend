import { apiClient } from './axios';
import type { Score } from './scoresApi';

export interface CartLine {
  id: number;
  score_sid: string;
  quantity: number;
  created_at: string;
  score: Score;
}

export interface CartListResponse {
  results: CartLine[];
  total_price: number;
  count: number;
}

export interface CartAddResponse {
  detail: string;
  cart_item: CartLine | { id: number; score_sid: string; quantity: number };
}

export const cartApi = {
  list: () => apiClient.get<CartListResponse>('/mypage/cart/'),
  add: (score_sid: string, quantity = 1) =>
    apiClient.post<CartAddResponse>('/mypage/cart/', { score_sid, quantity }),
  remove: (cartItemId: number) => apiClient.delete<{ deleted: boolean; id: number }>(`/mypage/cart/${cartItemId}/`),
};

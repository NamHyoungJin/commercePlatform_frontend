import { apiClient } from './axios';
import type { Score } from './scoresApi';

export type PrintdownRow = Score & {
  mypage_print_sid: number;
  print_start_date: string | null;
  print_end_date: string | null;
  action_count: number;
  action_limit: number;
  action_flag: string;
};

export interface PrintdownListResponse {
  count: number;
  page: number;
  page_size: number;
  results: PrintdownRow[];
}

export interface PrintdownPdfUrlResponse {
  /** CORS 허용 시 프론트에서 fetch→blob 인쇄용 */
  pdf_content_url: string;
  /** 인쇄 전용 HTML(대체·새 창) */
  print_url: string;
  /** PDF 직접 302(미리보기용) */
  url: string;
}

export const printdownApi = {
  list: (page = 1) => apiClient.get<PrintdownListResponse>('/mypage/printdown/', { params: { page } }),
  /** JWT 필요 — `print_url`을 새 창에서 열면 인쇄 페이지에서 자동/수동 `print()` */
  pdfUrl: (mypagePrintSid: number) =>
    apiClient.get<PrintdownPdfUrlResponse>(`/mypage/printdown/${mypagePrintSid}/pdf-url/`),
};

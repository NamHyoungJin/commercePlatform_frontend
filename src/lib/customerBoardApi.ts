import { isAxiosError } from 'axios';
import { apiClient } from './axios';
import { unwrapOnlyonemusicBody } from './onlyonemusicApi';

export type CustomerBoardKey = 'notice' | 'faq' | 'qna';

export interface CustomerBoardListItem {
  hj_board_sid: number;
  subject: string;
  author: string;
  write_datetime: string | null;
  hit: number;
  notify_flag: string;
  secret_flag: string;
}

export interface CustomerBoardListResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  results: CustomerBoardListItem[];
}

export interface CustomerBoardDetail extends CustomerBoardListItem {
  content_html: string;
  /** QNA 상세 — 본인 여부 판별용 */
  write_sid?: string;
  write_id?: string;
  /** QNA 상세 — 수정 폼 초기값(서버에서 HTML→텍스트) */
  content_text?: string;
}

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  return base.replace(/\/$/, '');
}

export async function fetchCustomerBoardList(
  boardKey: CustomerBoardKey,
  opts: { page?: number; q?: string; pageSize?: number },
): Promise<CustomerBoardListResponse> {
  const u = new URL(`${apiBase()}/customer-boards/${boardKey}/`);
  if (opts.page && opts.page > 1) u.searchParams.set('page', String(opts.page));
  if (opts.q?.trim()) u.searchParams.set('q', opts.q.trim());
  if (opts.pageSize) u.searchParams.set('page_size', String(opts.pageSize));

  const res = await fetch(u.toString(), { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`customer board list failed: ${res.status}`);
  }
  const body = await res.json();
  return unwrapOnlyonemusicBody<CustomerBoardListResponse>(body);
}

export async function fetchCustomerBoardDetail(
  boardKey: CustomerBoardKey,
  sid: string,
): Promise<CustomerBoardDetail | null> {
  const res = await fetch(`${apiBase()}/customer-boards/${boardKey}/${sid}/`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`customer board detail failed: ${res.status}`);
  }
  const body = await res.json();
  return unwrapOnlyonemusicBody<CustomerBoardDetail>(body);
}

/** 브라우저에서 호출 — `/scores` 등과 동일하게 `apiClient`(NEXT_PUBLIC_API_URL) 사용 */
export async function getCustomerBoardList(
  boardKey: CustomerBoardKey,
  opts: { page?: number; q?: string; pageSize?: number },
): Promise<CustomerBoardListResponse> {
  const { data } = await apiClient.get<CustomerBoardListResponse>(`/customer-boards/${boardKey}/`, {
    params: {
      page: opts.page && opts.page > 1 ? opts.page : undefined,
      q: opts.q?.trim() || undefined,
      page_size: opts.pageSize,
    },
  });
  return data;
}

export async function getCustomerBoardDetail(
  boardKey: CustomerBoardKey,
  sid: string,
): Promise<CustomerBoardDetail | null> {
  try {
    const { data } = await apiClient.get<CustomerBoardDetail>(`/customer-boards/${boardKey}/${sid}/`);
    return data;
  } catch (e: unknown) {
    if (isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}

export type CreateQnaPostPayload = { subject: string; content: string; secret?: boolean };

export type CreateQnaPostResult = { hj_board_sid: number };

/** 로그인 필요 — QNA 신규 글 */
export async function createCustomerQnaPost(payload: CreateQnaPostPayload): Promise<CreateQnaPostResult> {
  const { data } = await apiClient.post<CreateQnaPostResult>('/customer-boards/qna/', {
    subject: payload.subject.trim(),
    content: payload.content.trim(),
    secret: Boolean(payload.secret),
  });
  return data;
}

export async function updateCustomerQnaPost(
  hjBoardSid: string,
  payload: CreateQnaPostPayload,
): Promise<{ hj_board_sid: number }> {
  const { data } = await apiClient.patch<{ hj_board_sid: number }>(`/customer-boards/qna/${hjBoardSid}/`, {
    subject: payload.subject.trim(),
    content: payload.content.trim(),
    secret: Boolean(payload.secret),
  });
  return data;
}

export async function deleteCustomerQnaPost(hjBoardSid: string): Promise<void> {
  await apiClient.delete(`/customer-boards/qna/${hjBoardSid}/`);
}

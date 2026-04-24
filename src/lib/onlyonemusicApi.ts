/** Django `core.renderers.OnlyonemusicJSONRenderer` 응답 언랩 */
export const ONLYONEMUSIC_WRAP_KEY = 'OnlyonemusicAPIResponse' as const;

export type OnlyonemusicWrapped<T> = {
  [ONLYONEMUSIC_WRAP_KEY]: {
    ErrorCode: string;
    Message: string;
    Result: T;
  };
};

export function unwrapOnlyonemusicBody<T>(body: unknown): T {
  if (body && typeof body === 'object' && ONLYONEMUSIC_WRAP_KEY in (body as object)) {
    const w = (body as OnlyonemusicWrapped<T>)[ONLYONEMUSIC_WRAP_KEY];
    if (w.ErrorCode !== '00') {
      const e = new Error(w.Message || 'API 오류');
      (e as Error & { errorCode?: string }).errorCode = w.ErrorCode;
      throw e;
    }
    return w.Result as T;
  }
  return body as T;
}

function parseJsonIfString(data: unknown): unknown {
  if (typeof data !== 'string') return data;
  const t = data.trim();
  if (!t.startsWith('{') && !t.startsWith('[')) return data;
  try {
    return JSON.parse(data) as unknown;
  } catch {
    return data;
  }
}

function collectFieldErrorStrings(obj: Record<string, unknown>, out: string[]) {
  for (const val of Object.values(obj)) {
    if (val == null) continue;
    if (typeof val === 'string') {
      if (val.trim()) out.push(val);
      continue;
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        if (typeof item === 'string') {
          if (item.trim()) out.push(item);
        } else if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>;
          if (typeof o.string === 'string' && o.string.trim()) out.push(o.string);
          else collectFieldErrorStrings(item as Record<string, unknown>, out);
        }
      }
      continue;
    }
    if (typeof val === 'object') collectFieldErrorStrings(val as Record<string, unknown>, out);
  }
}

/** 4xx 등 오류 응답 본문에서 사용자에게 보여줄 문장만 추출 (래퍼·DRF 필드 오류 모두) */
export function extractApiErrorMessages(data: unknown): string[] {
  data = parseJsonIfString(data);
  if (data == null) return ['요청을 처리하지 못했습니다.'];
  if (typeof data === 'string') return [data.trim() || '요청을 처리하지 못했습니다.'];
  if (typeof data !== 'object') return [String(data)];

  const o = data as Record<string, unknown>;

  const wrapped = o[ONLYONEMUSIC_WRAP_KEY];
  if (wrapped && typeof wrapped === 'object') {
    const w = wrapped as { Message?: string; Result?: unknown };
    const inner = w.Result;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const msgs: string[] = [];
      collectFieldErrorStrings(inner as Record<string, unknown>, msgs);
      const filteredInner = msgs.map((s) => s.trim()).filter(Boolean);
      if (filteredInner.length) return filteredInner;
    }
    if (typeof inner === 'string') return [inner];
    /** ErrorCode≠00 이어도 서버가 Message에 사용자 문구를 넣는 경우 */
    if (typeof w.Message === 'string' && w.Message.trim()) return [w.Message.trim()];
  }

  if ('Result' in o && o.Result && typeof o.Result === 'object' && !Array.isArray(o.Result)) {
    const msgs: string[] = [];
    collectFieldErrorStrings(o.Result as Record<string, unknown>, msgs);
    const filteredResult = msgs.map((s) => s.trim()).filter(Boolean);
    if (filteredResult.length) return filteredResult;
  }

  const msgs: string[] = [];
  collectFieldErrorStrings(o, msgs);
  const filtered = msgs.map((s) => s.trim()).filter(Boolean);
  return filtered.length ? filtered : ['요청을 처리하지 못했습니다.'];
}

export function formatApiErrorMessage(data: unknown): string {
  return extractApiErrorMessages(data).join('\n');
}

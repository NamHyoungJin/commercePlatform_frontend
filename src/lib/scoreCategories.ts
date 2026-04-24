/** GNB·카테고리 목록과 동일 (구 _headMenu.htm / ScoreCategoryList) */
export const SCORE_CATEGORY_MENU = [
  { code: 'SYS20721B007', label: '어린이' },
  { code: 'SYS20721B003', label: '찬송가' },
  { code: 'SYS20721B004', label: '성탄절' },
  { code: 'SYS20721B001', label: '결혼식' },
] as const;

export const SCORE_CATEGORY_CODES = SCORE_CATEGORY_MENU.map((m) => m.code);

export function scoreCategoryHref(code: string): string {
  return `/score/ScoreCategoryList?code=${encodeURIComponent(code)}`;
}

export function scoreCategoryLabel(code: string): string {
  const row = SCORE_CATEGORY_MENU.find((m) => m.code === code);
  return row?.label ?? '카테고리';
}

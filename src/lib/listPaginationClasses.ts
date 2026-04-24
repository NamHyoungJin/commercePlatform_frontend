/**
 * 목록 페이지 숫자·Prev/Next 페이지네이션 — 현재 페이지는 모달 타이틀과 동일 브랜드 블루 (#2ca7e1)
 *
 * 비활성 버튼과 활성 표시를 같은 className에 합치지 말 것: bg/text 유틸이 충돌하면
 * Tailwind 번들 순서에 따라 활성색이 적용되지 않을 수 있음.
 */
const LIST_PAGINATION_NUM_LAYOUT =
  'inline-flex min-w-[40px] h-10 px-3 items-center justify-center rounded-full border text-sm transition-colors';

export const LIST_PAGINATION_BUTTON_CLASS =
  `${LIST_PAGINATION_NUM_LAYOUT} border-[var(--border-strong)] bg-surface-muted text-text-secondary hover:border-accent-teal/40 hover:bg-surface hover:text-text-primary`;

/** 숫자형 현재 페이지(악보 목록 등) — LIST_PAGINATION_BUTTON_CLASS와 병합하지 않음 */
export const LIST_PAGINATION_ACTIVE_CLASS =
  `${LIST_PAGINATION_NUM_LAYOUT} cursor-default border-[#2ca7e1] bg-[#2ca7e1] font-medium text-white shadow-sm`;

/** 직사각형·다른 레이아웃 위에 덧씌울 때만 (고객센터 게시판 등) */
export const LIST_PAGINATION_ACTIVE_SURFACE_CLASS =
  'border-[#2ca7e1] bg-[#2ca7e1] font-medium text-white shadow-sm';

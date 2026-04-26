/** 마이페이지 테이블 행·페이지네이션 버튼용 24px 뷰박스 아이콘 (stroke 통일) */
const stroke = {
  stroke: 'currentColor' as const,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
};

type IconProps = { className?: string };

export function MypageTrashIcon({ className = 'h-5 w-5 shrink-0' }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

export function MypagePrinterIcon({ className = 'h-5 w-5 shrink-0' }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" {...stroke}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect width="12" height="8" x="6" y="14" rx="1" />
    </svg>
  );
}

export function MypageSearchPlusIcon({ className = 'h-5 w-5 shrink-0' }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" {...stroke}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <line x1="11" x2="11" y1="8" y2="14" />
      <line x1="8" x2="14" y1="11" y2="11" />
    </svg>
  );
}

export function MypageChevronLeftIcon({ className = 'h-5 w-5 shrink-0' }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" {...stroke}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function MypageChevronRightIcon({ className = 'h-5 w-5 shrink-0' }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" {...stroke}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function MypageXIcon({ className = 'h-5 w-5 shrink-0' }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/** PDF·문서 미리보기 버튼용 */
export function MypageDocumentIcon({ className = 'h-5 w-5 shrink-0' }: IconProps) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" {...stroke}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

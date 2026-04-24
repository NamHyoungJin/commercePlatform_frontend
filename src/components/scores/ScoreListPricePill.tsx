import Link from 'next/link';

/**
 * `ScoreSongRow` 액션 열: `gridCellFixed` 등에서 한 칸 가로 ≈ 7.25rem
 * scoresType 등 리스트에서 가격 pill과 동일 폭
 */
export const SCORE_LIST_PRICE_CELL_W_CLASS = 'w-[7.25rem] min-w-[7.25rem] max-w-[7.25rem]' as const;

const pillVisual =
  'items-center justify-center whitespace-nowrap rounded-full border border-teal-600/35 bg-gradient-to-b from-teal-50 to-white font-medium leading-none text-teal-800 shadow-none transition-colors hover:border-teal-600/55 hover:from-teal-50/90';

type Props = {
  amount: number;
  /** 있으면 악보 상세로 이동하는 링크(리스트와 동일) */
  href?: string;
  /** `ScoreSongRow` large 행과 동일 스케일 */
  size?: 'default' | 'large';
  /**
   * `gridCell` — 2×2 액션 그리드 칸 전체 채움(다른 버튼과 동일 크기)
   * `gridCellFixed` — 테이블 등에서 위와 동일 가로(7.25rem) 고정
   */
  layout?: 'default' | 'gridCell' | 'gridCellFixed';
  className?: string;
};

/**
 * `/scores`·scoresType·홈 인기 차트 등 리스트 행의 가격 pill — `ScoreSongRow`와 동일 스타일
 */
export default function ScoreListPricePill({
  amount,
  href,
  size = 'large',
  layout = 'default',
  className = '',
}: Props) {
  const lg = size === 'large';
  const sizeCls = lg ? 'min-h-[2.5rem] px-3 py-2.5 text-sm' : 'min-h-[2.5rem] px-3 py-2 text-xs';
  const layoutCls =
    layout === 'gridCell'
      ? 'flex h-full w-full min-w-0'
      : layout === 'gridCellFixed'
        ? `flex h-full min-h-[2.5rem] shrink-0 ${SCORE_LIST_PRICE_CELL_W_CLASS}`
        : 'inline-flex max-w-full min-w-0';
  const cls = `${layoutCls} ${pillVisual} ${sizeCls} ${className}`.trim();
  const label = `${amount.toLocaleString('ko-KR')}원`;
  const inner = (
    <span className="min-w-0 truncate text-center font-bold tabular-nums tracking-tight text-teal-900">
      {amount.toLocaleString('ko-KR')}
      <span className="font-semibold text-teal-700">원</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className={cls} title={label}>
        {inner}
      </Link>
    );
  }

  return (
    <span className={cls} title={label}>
      {inner}
    </span>
  );
}

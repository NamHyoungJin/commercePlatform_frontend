'use client';

/** 레거시 wish / cart2 / printdown 테이블 구조만 유지. API 연동 전 빈 목록 안내. */

const COLS = ['No', '곡정보', '금액', '보기', '구매', '삭제'] as const;

export default function MypagePlaceholderTable({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="home-album-strip-title">{title}</h2>
      <p className="home-album-strip-sub mt-2">{description}</p>
      <p className="mt-4 rounded-lg border border-dashed border-[var(--border-strong)] bg-surface-muted px-4 py-6 text-center text-base leading-relaxed text-text-secondary">
        이 페이지는 새 사이트에서 곧 서버와 연동됩니다. 지금은 목록이 비어 있습니다.
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border-strong)]">
        <table className="w-full min-w-[520px] border-collapse text-left text-[15px] text-text-secondary sm:text-base">
          <thead>
            <tr className="border-b border-[var(--border-strong)] bg-surface-muted">
              {COLS.map((c) => (
                <th key={c} className="px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-text-muted sm:text-[15px]">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border-subtle)]">
              <td colSpan={6} className="px-3 py-10 text-center text-base text-text-muted">
                표시할 항목이 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import type { RecommendedKey } from '@/lib/vocalRangeKeyFinder';

function keyHeatClass(item: RecommendedKey): string {
  if (item.status === 'Comfortable' && item.score >= 0.55) {
    return 'border-emerald-600/70 bg-emerald-950/55 text-emerald-50 hover:bg-emerald-900/55';
  }
  if (
    item.status === 'Too High' ||
    item.status === 'Too Low' ||
    item.status === 'Too Wide' ||
    item.score < 0.22
  ) {
    return 'border-red-800/70 bg-red-950/50 text-red-50 hover:bg-red-900/45';
  }
  return 'border-amber-700/55 bg-amber-950/45 text-amber-50 hover:bg-amber-900/40';
}

type KeyHeatStrip12Props = {
  items: RecommendedKey[];
  selectedKey: string;
  onPick: (key: string) => void;
};

/** 12키(Db 표기 등) 적합도에 따른 색 + 선택 시 피아노·상세와 연동 */
export default function KeyHeatStrip12({ items, selectedKey, onPick }: KeyHeatStrip12Props) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-neutral-500">
        Key (적합도 색상)
      </p>
      <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
        {items.map((item) => {
          const active = selectedKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onPick(item.key)}
              className={`min-w-[2.25rem] rounded-md border px-2 py-2 text-sm font-bold tabular-nums transition ${keyHeatClass(item)} ${
                active ? 'ring-2 ring-white ring-offset-2 ring-offset-[#101010]' : ''
              }`}
            >
              {item.key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

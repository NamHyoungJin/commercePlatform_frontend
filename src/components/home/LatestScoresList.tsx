import Link from '@/components/AppLink';
import { Score } from '@/lib/scoresApi';

interface Props {
  scores: Score[];
  theme?: 'light' | 'dark';
}

export default function LatestScoresList({ scores, theme = 'light' }: Props) {
  const isDark = theme === 'dark';

  if (isDark) {
    return (
      <aside>
        <ul className="m-0 p-0 list-none divide-y divide-neutral-800">
          {scores.map((score) => (
            <li key={score.score_sid} className="list-none">
              <Link
                href={`/scores?sid=${encodeURIComponent(String(score.score_sid))}`}
                className="flex items-start justify-between gap-3 py-3.5 first:pt-0 hover:opacity-90 transition-opacity"
              >
                <span className="min-w-0 flex-1 line-clamp-2 text-[17px] font-semibold leading-snug text-white sm:text-lg md:text-xl">
                  {score.title}
                </span>
                <span className="inline-flex shrink-0 items-center rounded-full border border-neutral-600/80 bg-[#2d2d2d] px-2.5 py-1 text-[13px] font-medium text-neutral-400 sm:text-[15px]">
                  {score.score_type_name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {scores.length === 0 && (
          <p className="py-8 text-center text-base text-neutral-400">등록된 악보가 없습니다.</p>
        )}
      </aside>
    );
  }

  return (
    <aside className="rounded-xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.03] overflow-hidden">
      <ul className="divide-y divide-slate-100">
        {scores.map((score) => (
          <li key={score.score_sid} className="list-none">
            <Link
              href={`/scores?sid=${encodeURIComponent(String(score.score_sid))}`}
              className="flex items-baseline justify-between gap-3 py-3 px-4 hover:bg-teal-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800 truncate flex-1">{score.title}</span>
              <span className="text-xs font-semibold shrink-0 text-teal-700 bg-teal-50/80 px-2 py-0.5 rounded-md">
                {score.score_type_name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {scores.length === 0 && (
        <p className="text-sm text-slate-400 px-4 py-10 text-center">등록된 악보가 없습니다.</p>
      )}
    </aside>
  );
}

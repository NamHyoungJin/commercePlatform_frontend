'use client';

import { Score } from '@/lib/scoresApi';
import ScoreSongRow from '@/components/scores/ScoreSongRow';
import { useBelowLg } from '@/hooks/useBelowLg';

interface Props {
  scores: Score[];
}

export default function PopularScores({ scores }: Props) {
  const belowLg = useBelowLg();
  const limit = belowLg ? 4 : 10;
  const capped = scores.slice(0, limit);
  const left = belowLg ? capped : scores.slice(0, 5);
  const right = belowLg ? [] : scores.slice(5, 10);

  return (
    <div className="grid grid-cols-1 gap-y-0 lg:grid-cols-2 lg:gap-x-12 xl:gap-x-20 2xl:gap-x-24">
      <div className="min-w-0">
        {left.map((score) => (
          <ScoreSongRow key={score.score_sid} score={score} size="large" />
        ))}
      </div>
      <div className="min-w-0">
        {right.map((score) => (
          <ScoreSongRow key={score.score_sid} score={score} size="large" />
        ))}
      </div>
    </div>
  );
}

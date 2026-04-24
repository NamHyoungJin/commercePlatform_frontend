import Link from '@/components/AppLink';
import Image from 'next/image';
import { Score } from '@/lib/scoresApi';

interface Props {
  score: Score;
}

export default function ScoreCard({ score }: Props) {
  return (
    <Link href={`/scores?sid=${encodeURIComponent(String(score.score_sid))}`} className="group block">
      <div className="border rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
        {/* 썸네일 */}
        <div className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden">
          {score.thumbnail_url ? (
            <Image
              src={score.thumbnail_url}
              alt={score.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-4xl">♪</div>
          )}
          <div className="absolute top-2 left-2">
            <span className="rounded-full bg-accent-teal px-2 py-0.5 text-xs font-semibold text-white">
              {score.score_type_name}
            </span>
          </div>
        </div>

        {/* 정보 */}
        <div className="p-3">
          <p className="text-xs text-gray-400 truncate">{score.music.kor_name}</p>
          <h3 className="text-sm font-semibold text-gray-800 truncate mt-0.5">{score.title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{score.chord_name} · {score.language_name}</span>
            <span className="text-sm font-bold tabular-nums text-accent-amber">
              {score.price.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

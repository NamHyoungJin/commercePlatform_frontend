'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from '@/components/AppLink';
import { scoresApi, VideoScoreItem } from '@/lib/scoresApi';
import { useBelowLg } from '@/hooks/useBelowLg';
import HomeSectionTitle from '@/components/home/HomeSectionTitle';
import { Video } from 'lucide-react';

export default function VideoScoresSection() {
  const [items, setItems] = useState<VideoScoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const belowLg = useBelowLg();

  useEffect(() => {
    scoresApi
      .youtubeScores(6)
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <HomeSectionTitle
          title="동영상 악보"
          subtitle="유튜브와 연동된 악보입니다."
          icon={<Video />}
        />
        <div className="rounded-xl border border-[var(--border-subtle)] bg-surface px-4 py-14 text-center text-base text-text-secondary">
          불러오는 중…
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <HomeSectionTitle
          title="동영상 악보"
          subtitle="유튜브와 연동된 악보입니다."
          icon={<Video />}
        />
        <div className="rounded-xl border border-[var(--border-subtle)] bg-surface px-4 py-12 text-center text-base text-text-secondary">
          등록된 동영상 악보가 없습니다.
        </div>
      </>
    );
  }

  return (
    <>
      <HomeSectionTitle
        title="동영상 악보"
        subtitle="유튜브와 연동된 악보입니다. 최신 6곡을 한 화면에 표시합니다."
        icon={<Video />}
      />
      <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-6">
        {(belowLg ? items.slice(0, 2) : items).map((row) => (
          <div
            key={row.score_sid}
            className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 transition-colors hover:border-neutral-600"
          >
            <Link
              href={`/scores?sid=${encodeURIComponent(String(row.score_sid))}`}
              className="block relative w-full aspect-[16/9] bg-neutral-950 shrink-0"
            >
              {row.youtube_thumbnail_url ? (
                <Image
                  src={row.youtube_thumbnail_url}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 28vw, 45vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-2xl sm:text-3xl">
                  ▶
                </div>
              )}
            </Link>
            <div className="min-h-0 flex-1 space-y-1 border-t border-neutral-700/80 bg-neutral-900 p-2.5 sm:p-3">
              <h4 className="line-clamp-2 text-[17px] font-semibold leading-snug text-white sm:text-lg md:text-xl">
                <Link
                  href={`/scores?sid=${encodeURIComponent(String(row.score_sid))}`}
                  className="transition-colors hover:text-neutral-100"
                >
                  {row.title}
                </Link>
              </h4>
              <p className="line-clamp-3 text-[15px] leading-relaxed text-neutral-200 sm:text-base">
                {row.music_write} · {row.music_compose}
                <br />
                {row.score_type_name} · {row.language_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

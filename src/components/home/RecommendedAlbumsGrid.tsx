'use client';

import Link from '@/components/AppLink';
import Image from 'next/image';
import type { AlbumBrowseItem } from '@/components/home/AlbumBrowseTopCharts';
import { useBelowLg } from '@/hooks/useBelowLg';

interface Props {
  albums: AlbumBrowseItem[];
}

/** 하단 전용 — 가로 6 × 세로 2(최대 12), 풀폭 그리드 */
export default function RecommendedAlbumsGrid({ albums }: Props) {
  const belowLg = useBelowLg();
  const max = belowLg ? 4 : 12;
  const list = albums.slice(0, max);
  if (!list.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {list.map((album) => (
        <Link
          key={album.album_sid}
          href={`/scores/album?sid=${encodeURIComponent(album.album_sid)}`}
          className="group block min-w-0"
        >
          <div className="relative aspect-square overflow-hidden rounded-xl border border-teal-950/40 bg-[#151c1c] ring-1 ring-teal-900/20 transition-all group-hover:border-teal-800/60 group-hover:ring-teal-800/30">
            {album.thumbnail_url ? (
              <Image
                src={album.thumbnail_url}
                alt={album.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 16vw, (min-width: 640px) 28vw, 45vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-3xl text-teal-900/50">♪</div>
            )}
          </div>
          <p className="mt-2.5 line-clamp-2 px-0.5 text-center text-[17px] font-semibold leading-snug text-teal-100 sm:text-lg md:text-xl">
            {album.name}
          </p>
        </Link>
      ))}
    </div>
  );
}

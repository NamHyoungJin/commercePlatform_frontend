'use client';

import Link from '@/components/AppLink';
import Image from 'next/image';
import { useBelowLg } from '@/hooks/useBelowLg';

export interface AlbumBrowseItem {
  album_sid: string;
  name: string;
  artist: string;
  thumbnail_url: string | null;
  intro?: string;
}

interface Props {
  albums: AlbumBrowseItem[];
}

/** 앨범 둘러보기 — 정사각 커버 + 하단 타이틀·설명(커버 위 배지 문구 없음) */
export default function AlbumBrowseTopCharts({ albums }: Props) {
  const belowLg = useBelowLg();
  const max = belowLg ? 4 : 12;
  const list = albums.slice(0, max);
  if (!list.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
      {list.map((album) => (
          <Link
            key={album.album_sid}
            href={`/scores/album?sid=${encodeURIComponent(album.album_sid)}`}
            className="group block min-w-0"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-neutral-200">
              {album.thumbnail_url ? (
                <Image
                  src={album.thumbnail_url}
                  alt={album.name}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 28vw, 45vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-4xl text-text-muted">♪</div>
              )}
            </div>
            <h3 className="mt-3 line-clamp-2 text-[17px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-accent-teal-hover sm:text-lg md:text-xl">
              {album.name}
            </h3>
            {(album.intro || '').trim() ? (
              <p className="mt-1.5 line-clamp-4 text-[15px] leading-relaxed text-text-secondary sm:text-base">
                {(album.intro || '').trim()}
              </p>
            ) : null}
          </Link>
        ))}
    </div>
  );
}

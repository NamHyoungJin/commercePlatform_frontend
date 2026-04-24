'use client';

import Link from '@/components/AppLink';
import Image from 'next/image';

interface Album {
  album_sid: string;
  name: string;
  artist: string;
  thumbnail_url: string | null;
}

interface Props {
  albums: Album[];
  /** dark: PraiseCharts식 다크 스트립 */
  theme?: 'light' | 'dark';
}

export default function AlbumGrid({ albums, theme = 'light' }: Props) {
  if (!albums.length) return null;

  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-2.5">
      {albums.map((album) => (
        <div key={album.album_sid} className="group relative">
          <Link href={`/scores/album?sid=${encodeURIComponent(album.album_sid)}`} className="block relative overflow-hidden rounded-lg">
            <div
              className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                isDark
                  ? 'border border-neutral-700 bg-neutral-900 shadow-none group-hover:border-neutral-500 group-hover:ring-1 group-hover:ring-white/10'
                  : 'border border-slate-200/90 bg-white shadow-sm group-hover:shadow-md group-hover:border-teal-200/50'
              }`}
            >
              {album.thumbnail_url ? (
                <Image
                  src={album.thumbnail_url}
                  alt={album.name}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="100px"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center text-3xl ${isDark ? 'text-neutral-600' : 'text-slate-200'}`}
                >
                  ♪
                </div>
              )}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between text-white text-center text-xs pointer-events-none"
                style={{
                  background: isDark
                    ? 'linear-gradient(to top, rgba(0,0,0,0.92), rgba(38,38,38,0.5))'
                    : 'linear-gradient(to top, rgba(15,23,42,0.88), rgba(15,23,42,0.45))',
                }}
              >
                <div className="flex-1 flex items-center justify-center px-2 pt-3">
                  <p className="desc line-clamp-3 font-semibold leading-snug text-[13px] text-white">{album.name}</p>
                </div>
                <div className="pb-3">
                  <span className="inline-block px-3 py-1.5 rounded-full bg-neutral-700 text-[11px] font-semibold uppercase tracking-wide text-white border border-neutral-600 pointer-events-auto">
                    View
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

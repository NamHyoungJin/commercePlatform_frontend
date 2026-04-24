'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from '@/components/AppLink';
import { useCallback, useEffect, useState } from 'react';

interface Album {
  album_sid: string;
  name: string;
  artist: string;
  thumbnail_url: string | null;
}

interface Props {
  albums: Album[];
  theme?: 'light' | 'dark';
}

export default function FeaturedAlbumCarousel({ albums, theme = 'light' }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selected, setSelected] = useState(0);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', () => setSelected(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!albums.length) return null;

  const shell = isDark
    ? 'rounded-xl border border-neutral-800 bg-neutral-900/80 overflow-hidden shadow-none'
    : 'rounded-xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/[0.04] overflow-hidden';

  return (
    <div className={`relative ${shell}`}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {albums.map((album) => (
            <div key={album.album_sid} className="flex-none w-full min-w-0">
              <Link href={`/scores/album?sid=${encodeURIComponent(album.album_sid)}`} className="block">
                <div
                  className={`relative aspect-square w-full max-h-[280px] mx-auto ${isDark ? 'bg-[#1a1a1a]' : 'bg-slate-50'}`}
                >
                  {album.thumbnail_url ? (
                    <Image
                      src={album.thumbnail_url}
                      alt={album.name}
                      fill
                      unoptimized
                      className="object-contain"
                      sizes="(max-width:768px) 100vw, 370px"
                    />
                  ) : (
                    <div
                      className={`flex items-center justify-center h-full text-5xl ${isDark ? 'text-neutral-600' : 'text-slate-200'}`}
                    >
                      ♪
                    </div>
                  )}
                </div>
                <p
                  className={`text-center mt-3 mb-1 px-3 line-clamp-2 font-semibold ${
                    isDark ? 'text-[15px] text-white' : 'text-[15px] text-slate-800'
                  }`}
                >
                  {album.name}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`flex justify-center gap-1.5 py-3 border-t ${isDark ? 'bg-[#141414] border-neutral-800' : 'bg-slate-50/50 border-slate-100'}`}
      >
        {albums.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`슬라이드 ${i + 1}`}
            className="h-2 rounded-full transition-all"
            style={{
              width: selected === i ? 22 : 8,
              background: selected === i ? (isDark ? '#fafafa' : '#0d9488') : isDark ? '#525252' : '#cbd5e1',
            }}
            onClick={() => emblaApi?.scrollTo(i)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={prev}
        className={`absolute left-2 top-[32%] -translate-y-1/2 z-10 w-9 h-11 flex items-center justify-center rounded-md border transition-colors ${
          isDark
            ? 'bg-neutral-800 border-neutral-600 text-neutral-200 hover:text-white hover:bg-neutral-700'
            : 'bg-white/95 border-slate-200 text-slate-500 hover:text-teal-700 hover:border-teal-200 shadow-sm'
        }`}
        aria-label="이전"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        className={`absolute right-2 top-[32%] -translate-y-1/2 z-10 w-9 h-11 flex items-center justify-center rounded-md border transition-colors ${
          isDark
            ? 'bg-neutral-800 border-neutral-600 text-neutral-200 hover:text-white hover:bg-neutral-700'
            : 'bg-white/95 border-slate-200 text-slate-500 hover:text-teal-700 hover:border-teal-200 shadow-sm'
        }`}
        aria-label="다음"
      >
        ›
      </button>
    </div>
  );
}

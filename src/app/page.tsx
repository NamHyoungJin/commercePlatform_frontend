'use client';

import { useEffect, useMemo, useState } from 'react';
import { scoresApi, Score } from '@/lib/scoresApi';
import HomeSearchBar from '@/components/home/HomeSearchBar';
import AlbumBrowseTopCharts from '@/components/home/AlbumBrowseTopCharts';
import RecommendedAlbumsGrid from '@/components/home/RecommendedAlbumsGrid';
import SloganBanner from '@/components/home/SloganBanner';
import VideoScoresSection from '@/components/home/VideoScoresSection';
import PopularScores from '@/components/home/PopularScores';
import WhyOnlyOneMusic from '@/components/home/WhyOnlyOneMusic';
import HomeSectionTitle from '@/components/home/HomeSectionTitle';
import { BarChart3, Disc3, Star } from 'lucide-react';

interface Album {
  album_sid: string;
  name: string;
  artist: string;
  thumbnail_url: string | null;
  intro?: string;
}

export default function HomePage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [latestScores, setLatestScores] = useState<Score[]>([]);
  const [popularScores, setPopularScores] = useState<Score[]>([]);

  useEffect(() => {
    scoresApi.albumsLatest().then((r) => setAlbums(r.data)).catch(() => {});
    scoresApi.latest().then((r) => setLatestScores(r.data)).catch(() => {});
    scoresApi.popular().then((r) => setPopularScores(r.data)).catch(() => {});
  }, []);

  /** 상단 «앨범 둘러보기» 최대 12개(가로 6×2줄), 하단 «추천 앨범»은 그다음 최대 12개 */
  const { featuredAlbums, browseAlbums } = useMemo(() => {
    return {
      browseAlbums: albums.slice(0, 12),
      featuredAlbums: albums.slice(12, 24),
    };
  }, [albums]);

  return (
    <div className="bg-background">
      <HomeSearchBar />

      {/* 인기 차트 — 표면 레이어(본문 배경보다 한 단계 밝게) */}
      <section className="border-y border-[var(--border-subtle)] bg-surface">
        <div className="mx-auto max-w-pc px-4 py-14 sm:px-6 md:py-20">
          <HomeSectionTitle
            title="인기 악보 차트"
            subtitle="지금 가장 많이 찾는 악보입니다. 두 열로 빠르게 훑어보세요."
            icon={<BarChart3 />}
          />
          <PopularScores scores={popularScores} />
        </div>
      </section>

      <WhyOnlyOneMusic latestScores={latestScores} />

      {/* 앨범 둘러보기 — 쿨 톤 다크(인기 차트·슬로건과 구분) */}
      {browseAlbums.length > 0 && (
        <section className="border-b border-[var(--border-subtle)] bg-surface-muted">
          <div className="mx-auto max-w-pc px-4 py-14 sm:px-6 md:py-20">
            <HomeSectionTitle
              title="앨범 둘러보기"
              subtitle="등록된 앨범 소개를 요약해 보여 드립니다. 카드를 누르면 앨범명으로 악보를 검색합니다."
              icon={<Disc3 />}
            />
            <AlbumBrowseTopCharts albums={browseAlbums} />
          </div>
        </section>
      )}

      <SloganBanner />

      {/* 동영상 악보 — 징크 톤 다크 */}
      <section className="border-b border-[var(--border-subtle)] bg-surface-muted">
        <div className="mx-auto max-w-pc px-4 py-14 sm:px-6 md:py-20">
          <VideoScoresSection />
        </div>
      </section>

      {/* 추천 앨범 — 하단 전용, 틸 톤 · 가로 6 × 세로 2(최대 12) */}
      {featuredAlbums.length > 0 && (
        <section className="border-b border-[var(--border-subtle)] bg-gradient-to-b from-teal-50/90 via-surface-muted to-background">
          <div className="mx-auto max-w-pc px-4 py-14 sm:px-6 md:py-20">
            <HomeSectionTitle
              title="추천 앨범"
              subtitle="에디터가 고른 앨범입니다. 한 화면에 최대 12개까지, 가로 6열로 배치됩니다."
              icon={<Star />}
            />
            <RecommendedAlbumsGrid albums={featuredAlbums} />
          </div>
        </section>
      )}
    </div>
  );
}

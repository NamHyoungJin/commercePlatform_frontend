import { Suspense } from 'react';
import AlbumScoresClient from './AlbumScoresClient';

export const metadata = { title: '앨범별 악보 | OnlyOneMusic' };

export default function AlbumScoresPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-[var(--background)] p-8 text-center text-neutral-500">로딩 중...</div>}>
      <AlbumScoresClient />
    </Suspense>
  );
}

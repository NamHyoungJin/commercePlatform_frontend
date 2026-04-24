import { Suspense } from 'react';
import ScoresClient from '@/app/scores/ScoresClient';

export const metadata = { title: '악보 검색 | OnlyOneMusic' };

export default function ScoresSearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">로딩 중...</div>}>
      <ScoresClient listBasePath="/scoresSearch" />
    </Suspense>
  );
}

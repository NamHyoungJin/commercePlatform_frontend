import { Suspense } from 'react';
import type { Metadata } from 'next';
import ScoresCategoryClient from './ScoresCategoryClient';

export const metadata: Metadata = { title: '카테고리 | OnlyOneMusic' };

export default function ScoreCategoryListPage() {
  return (
    <Suspense fallback={<div className="bg-[var(--background)] p-8 text-center text-neutral-500">로딩 중...</div>}>
      <ScoresCategoryClient />
    </Suspense>
  );
}

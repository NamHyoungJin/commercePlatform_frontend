import { Suspense } from 'react';
import ScoresPageClient from './ScoresPageClient';

export const metadata = { title: '악보 목록 | OnlyOneMusic' };

export default function ScoresPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">로딩 중...</div>}>
      <ScoresPageClient />
    </Suspense>
  );
}

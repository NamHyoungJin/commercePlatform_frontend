import { Suspense } from 'react';
import ScoresTypeClient from './ScoresTypeClient';

export const metadata = { title: '악보 형식 | OnlyOneMusic' };

export default function ScoresTypePage() {
  return (
    <Suspense fallback={<div className="bg-[var(--background)] p-8 text-center text-neutral-500">로딩 중...</div>}>
      <ScoresTypeClient />
    </Suspense>
  );
}

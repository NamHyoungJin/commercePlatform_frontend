'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ScoreDetailView from '@/components/scores/ScoreDetailView';
import ScoresClient from './ScoresClient';

export default function ScoresPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sid = useMemo(() => (searchParams.get('sid') ?? '').trim(), [searchParams]);
  const q = useMemo(() => (searchParams.get('q') ?? '').trim(), [searchParams]);

  useEffect(() => {
    if (!sid && q) {
      const u = new URLSearchParams();
      searchParams.forEach((val, key) => {
        if (val.length > 0) u.set(key, val);
      });
      router.replace(`/scoresSearch?${u.toString()}`);
    }
  }, [sid, q, router, searchParams]);

  if (sid) {
    return <ScoreDetailView scoreSid={sid} />;
  }

  if (q) {
    return <div className="p-8 text-center text-gray-400">이동 중...</div>;
  }

  return <ScoresClient listBasePath="/scores" />;
}

'use client';

import { useEffect, useState } from 'react';

const QUERY = '(max-width: 1023px)';

/**
 * Tailwind `lg` 브레이크포인트 미만(1023px 이하).
 * 초기값 false로 SSR·첫 하이드레이션과 맞춘 뒤, 마운트 직후 실제 뷰포트로 동기화합니다.
 */
export function useBelowLg(): boolean {
  const [below, setBelow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const sync = () => setBelow(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return below;
}
